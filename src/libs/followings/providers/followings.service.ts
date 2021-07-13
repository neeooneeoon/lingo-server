import { Model, Types } from 'mongoose';
import { Following, FollowingDocument } from '@entities/following.entity';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from '@libs/users/providers/users.service';
import { TagsService } from './tags.service';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { CheckFollowing } from '@dto/following';

@Injectable()
export class FollowingsService {
  constructor(
    @InjectModel(Following.name)
    private followingModel: Model<FollowingDocument>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private readonly tagsService: TagsService,
  ) {}

  public getMyFollowings(
    currentUser: string,
    tagIds: string[],
    currentPage: number,
  ): Observable<FollowingDocument[]> {
    const nPerPage = 15;
    const nSkip = currentPage <= 0 ? 0 : (currentPage - 1) * nPerPage;
    const followUserRef = ['displayName', 'avatar', 'xp'];
    const tagRef = ['color', 'name'];
    const unSelect = ['-__v'];

    if (tagIds.includes('all')) {
      const followings$ = from(
        this.followingModel
          .find({
            user: Types.ObjectId(currentUser),
          })
          .skip(nSkip)
          .limit(nPerPage)
          .populate('followUser', followUserRef)
          .populate('tags', tagRef)
          .select(unSelect),
      );
      return followings$;
    } else {
      const followings$ = from(
        this.followingModel
          .find({
            user: Types.ObjectId(currentUser),
            tags: {
              $elemMatch: {
                $in: tagIds,
              },
            },
          })
          .skip(nSkip)
          .limit(nPerPage)
          .populate('followUser', followUserRef)
          .populate('tags', tagRef)
          .select(unSelect),
      );
      return followings$;
    }
  }

  public allFollowings(currentUser: string): Observable<FollowingDocument[]> {
    return from(
      this.followingModel.find({
        user: Types.ObjectId(currentUser),
      }),
    );
  }

  public async followings(currentUser: string) {
    try {
      const listFollowings = await this.followingModel.find({
        user: Types.ObjectId(currentUser),
      });
      return listFollowings;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public startFollow(
    currentUser: string,
    followUser: string,
    tagId?: string,
  ): Observable<FollowingDocument> {
    if (currentUser === followUser) {
      throw new BadRequestException('You can not follow yourself');
    }
    return forkJoin([
      this.allFollowings(currentUser),
      this.usersService.findUser(followUser),
    ]).pipe(
      map(([followings, user]) => {
        let followingIds: string[] = [];
        if (followings && followings.length > 0) {
          followingIds = followings.map((item) => String(item._id));
        }
        if (followingIds.includes(followUser)) {
          throw new BadRequestException('Already follow this user');
        }
        return {
          followingIds: followingIds,
          followUser: user,
        };
      }),
      mergeMap(({ followUser }) => {
        if (tagId) {
          return this.tagsService.findTag(currentUser, tagId).pipe(
            map((tag) => {
              return {
                followUserId: followUser.userId,
                tagId: String(tag._id),
              };
            }),
          );
        } else {
          return of({
            followUserId: followUser.userId,
            tagId: undefined,
          });
        }
      }),
      switchMap(({ followUserId, tagId }) => {
        return from(
          this.followingModel.create({
            user: Types.ObjectId(currentUser),
            followUser: Types.ObjectId(followUserId),
            tags: tagId ? [tagId] : [],
          }),
        );
      }),
      map((newFollowing) => {
        if (!newFollowing) {
          throw new BadRequestException(`Can't follow this user`);
        }
        return newFollowing;
      }),
    );
  }

  public unFollow(
    currentUser: string,
    followedUser: string,
  ): Observable<string> {
    return from(
      this.followingModel.deleteOne({
        user: Types.ObjectId(currentUser),
        followUser: Types.ObjectId(followedUser),
      }),
    ).pipe(
      map((deleteResult) => {
        if (deleteResult.deletedCount === 1) {
          return 'Un-follow success';
        } else {
          throw new InternalServerErrorException();
        }
      }),
    );
  }

  public async addTagToFollowingUser(
    currentUser: string,
    followId: string,
    tagId: string,
  ): Promise<string> {
    try {
      const formattedTagId = tagId.trim();
      if (formattedTagId) {
        const allTagPromise = this.tagsService.viewTags(currentUser);
        const followingPromise = this.followingModel.findOne({
          user: Types.ObjectId(currentUser),
          _id: Types.ObjectId(followId),
        });

        const [listUserTags, following] = await Promise.all([
          allTagPromise,
          followingPromise,
        ]);
        if (!following || !listUserTags || listUserTags.length === 0) {
          throw new BadRequestException(
            'No user tag, not found user following',
          );
        }
        const userTagIds = listUserTags.map((item) => String(item._id));
        let assignedTags = following.tags;
        const deleteTags = assignedTags.filter(
          (item) => !userTagIds.includes(item),
        );

        if (!userTagIds.includes(tagId)) {
          throw new BadRequestException(`Can't find tag`);
        }

        if (!following) {
          throw new BadRequestException(`Can't find following`);
        }
        if (deleteTags.length > 0) {
          const updated = await this.followingModel.findOneAndUpdate(
            {
              _id: Types.ObjectId(followId),
            },
            {
              $pullAll: {
                tags: deleteTags,
              },
            },
            { new: true },
          );
          assignedTags = updated.tags;
        }
        if (assignedTags.includes(tagId)) {
          const updateResult = await this.followingModel.updateOne(
            {
              _id: Types.ObjectId(followId),
            },
            {
              $pullAll: {
                tags: [tagId],
              },
            },
          );
          if (updateResult.nModified === 1) {
            return 'Un-assign tag success';
          }
        } else {
          if (assignedTags.length >= 3) {
            throw new BadRequestException(
              'Chỉ được gán tối đa 3 thẻ cho một người dùng',
            );
          }
          const updateResult = await this.followingModel.updateOne(
            {
              _id: Types.ObjectId(followId),
            },
            {
              $push: {
                tags: tagId,
              },
            },
          );
          if (updateResult.nModified === 1) {
            return 'Assign tag success';
          }
        }
      }
      throw new BadRequestException('Assign tag failed');
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async checkIsFollowing(
    currentUserId: string,
    userId: string,
  ): Promise<CheckFollowing> {
    try {
      const [listFollowings, otherUserProfile] = await Promise.all([
        this.followings(currentUserId),
        this.usersService.queryMe(userId),
      ]);
      if (!otherUserProfile) {
        throw new BadRequestException('Can`t find user');
      }
      const followUserIds = listFollowings.map((item) =>
        String(item.followUser),
      );
      return {
        ...otherUserProfile,
        followed: followUserIds.includes(userId),
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
