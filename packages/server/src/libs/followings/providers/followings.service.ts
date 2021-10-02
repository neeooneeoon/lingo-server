import { Role } from '@utils/enums';
import { LeanDocument, Model, Types } from 'mongoose';
import { Following, FollowingDocument } from '@entities/following.entity';
import {
  BadRequestException,
  CACHE_MANAGER,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from '@libs/users/providers/users.service';
import { TagsService } from './tags.service';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CheckFollowing } from '@dto/following';
import { UserRank } from '@dto/leaderBoard/userRank.dto';
import { UserDocument } from '@entities/user.entity';
import { Cache } from 'cache-manager';
import { ConfigsService } from '@configs';
import { MAX_TTL } from '@utils/constants';

@Injectable()
export class FollowingsService {
  private readonly logger = new Logger();
  private prefixKey: string;
  constructor(
    @InjectModel(Following.name)
    private followingModel: Model<FollowingDocument>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private readonly tagsService: TagsService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly configsService: ConfigsService,
  ) {
    this.prefixKey = this.configsService.get('MODE');
  }

  public async countFollowings(
    currentUser: string,
  ): Promise<{ items: Array<string>; count: number }> {
    const cachedCounter = await this.cache.get<Array<string>>(
      `${this.prefixKey}/followings/${currentUser}`,
    );
    if (cachedCounter)
      return {
        items: cachedCounter,
        count: cachedCounter?.length,
      };
    const items = await this.followingModel
      .find({
        user: Types.ObjectId(currentUser),
      })
      .select(['followUser'])
      .lean();
    if (items) {
      await this.cache.set<Array<string>>(
        `${this.prefixKey}/followings/${currentUser}`,
        items.map((item) => String(item.followUser)),
        {
          ttl: MAX_TTL,
        },
      );
      return {
        items: items.map((item) => String(item.followUser)),
        count: items?.length,
      };
    }
    return {
      items: [],
      count: 0,
    };
  }

  public async pushToCache() {
    const groups: Array<{ user: string; items: Array<string> }> =
      await this.followingModel.aggregate([
        {
          $group: {
            _id: {
              user: '$user',
            },
            items: {
              $push: '$followUser',
            },
          },
        },
        {
          $project: {
            _id: 0,
            user: '$_id.user',
            items: '$items',
          },
        },
      ]);
    await Promise.all(
      groups.map((element) => {
        const path = `${this.prefixKey}/followings/${element.user}`;
        return this.cache.set<Array<string>>(path, element.items, {
          ttl: MAX_TTL,
        });
      }),
    );
    return groups;
  }

  public getMyFollowings(
    currentUser: string,
    tagIds: string[],
    currentPage: number,
  ) {
    const nPerPage = 10;
    const nSkip = currentPage <= 0 ? 0 : (currentPage - 1) * nPerPage;
    const followUserRef = ['displayName', 'avatar', 'xp'];
    const tagRef = ['color', 'name'];
    const unSelect = ['-__v'];
    const total$ = from(this.countFollowings(currentUser));

    if (!tagIds || tagIds?.includes('all')) {
      const followings$ = from(
        this.followingModel
          .find({
            user: Types.ObjectId(currentUser),
          })
          .skip(nSkip)
          .limit(nPerPage)
          .populate('followUser', followUserRef)
          .populate('tags', tagRef)
          .select(unSelect)
          .lean(),
      );
      return forkJoin([total$, followings$]).pipe(
        map(([total, followings]) => {
          return {
            total: total.count,
            items: followings,
          };
        }),
      );
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
          .select(unSelect)
          .lean(),
      );
      return forkJoin([total$, followings$]).pipe(
        map(([total, followings]) => {
          return {
            total: total.count,
            items: followings,
          };
        }),
      );
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
      return this.followingModel
        .find({
          user: Types.ObjectId(currentUser),
        })
        .select(['followUser'])
        .lean();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public updateFollowingInCache(
    currentUser: string,
    value: string,
    isDelete: boolean,
  ): Observable<{ items: Array<string>; count: number }> {
    const path = `${this.prefixKey}/followings/${currentUser}`;
    return from(this.cache.get<Array<string>>(path)).pipe(
      switchMap((snapshot) => {
        if (snapshot) {
          const list = new Set(snapshot);
          isDelete ? list.delete(value) : list.add(value);
          this.cache
            .set<Array<string>>(path, [...list], {
              ttl: MAX_TTL,
            })
            .then((r) => {
              this.logger.log({
                status: r,
                time: this.logger.getTimestamp(),
              });
            });
          return of({
            items: [...list],
            count: list?.size,
          });
        } else {
          return from(this.countFollowings(currentUser)).pipe(
            map((result) => {
              return result;
            }),
          );
        }
      }),
    );
  }

  public startFollow(
    currentUser: string,
    followUser: string,
    tagId?: string,
  ): Observable<FollowingDocument> {
    if (currentUser === followUser) {
      throw new BadRequestException('You can not follow yourself');
    }
    const trimmedTagId = tagId?.trim();
    if (trimmedTagId) {
      return forkJoin([
        this.usersService.findUser(followUser),
        this.tagsService.findTag(currentUser, tagId),
      ]).pipe(
        switchMap(([user, tag]) => {
          if (user && tag) {
            return from(
              this.followingModel.create({
                user: Types.ObjectId(currentUser),
                followUser: Types.ObjectId(followUser),
                tags: [trimmedTagId],
              }),
            ).pipe(
              switchMap((following) => {
                if (following) {
                  this.updateFollowingInCache(currentUser, followUser, false)
                    .pipe(map((r) => r))
                    .subscribe(console.log);
                  return of(following);
                } else throw new BadRequestException();
              }),
            );
          } else {
            throw new BadRequestException();
          }
        }),
      );
    } else {
      return from(this.usersService.findUser(followUser)).pipe(
        switchMap((user) => {
          if (user) {
            return from(
              this.followingModel.create({
                user: Types.ObjectId(currentUser),
                followUser: Types.ObjectId(followUser),
                tags: [],
              }),
            ).pipe(
              switchMap((following) => {
                if (following) {
                  this.updateFollowingInCache(currentUser, followUser, false)
                    .pipe(map((r) => r))
                    .subscribe(console.log);
                  return of(following);
                }
              }),
            );
          } else {
            throw new BadRequestException();
          }
        }),
      );
    }
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
      switchMap((deleteResult) => {
        if (deleteResult.deletedCount === 1) {
          this.updateFollowingInCache(currentUser, followedUser, true)
            .pipe(map((r) => r))
            .subscribe();
          return of('Un-follow success');
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
    const formattedTagId = tagId.trim();
    if (formattedTagId) {
      const [listUserTags, following] = await Promise.all([
        this.tagsService.getUserTags(currentUser).toPromise(),
        this.followingModel.findOne({
          user: Types.ObjectId(currentUser),
          _id: Types.ObjectId(followId),
        }),
      ]);
      if (!following || !listUserTags || listUserTags.length === 0) {
        throw new BadRequestException('No user tag, not found user following');
      }
      const userTagIds = listUserTags.map((item) => String(item._id));
      if (!userTagIds.includes(tagId)) {
        throw new BadRequestException(`Can't find tag`);
      }
      let assignedTags = following.tags;
      const deleteTags = assignedTags.filter(
        (item) => !userTagIds.includes(item),
      );
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
  }

  public async findFollowing(
    currentUser: string,
    followUser: string,
  ): Promise<LeanDocument<FollowingDocument>> {
    return this.followingModel
      .findOne({
        user: Types.ObjectId(currentUser),
        followUser: Types.ObjectId(followUser),
      })
      .select(['_id'])
      .lean();
  }

  public async checkIsFollowing(
    currentUserId: string,
    userId: string,
  ): Promise<CheckFollowing> {
    const [following, otherUserProfile] = await Promise.all([
      this.findFollowing(currentUserId, userId),
      this.usersService.queryMe(userId),
    ]);
    if (!otherUserProfile) {
      throw new BadRequestException('Can`t find user');
    }
    return {
      ...otherUserProfile,
      followed: !!following,
    };
  }
  public async getAllTimeFollowingsXp(
    userId: string,
    role?: Role,
  ): Promise<UserRank[]> {
    try {
      const select = ['xp', '_id', 'avatar', 'displayName', 'role'];
      const xpArr = await this.followingModel
        .find({ user: new Types.ObjectId(userId) })
        .populate('followUser', select);
      return xpArr
        .map((i) => {
          const user = i.followUser as unknown as UserDocument;
          if (!role) {
            const userRank: UserRank = {
              orderNumber: 0,
              isCurrentUser: false,
              avatar: user.avatar,
              displayName: user.displayName,
              userId: user._id,
              xp: user.xp,
              role: user.role,
            };
            return userRank;
          } else if (user.role === role) {
            const userRank: UserRank = {
              orderNumber: 0,
              isCurrentUser: false,
              avatar: user.avatar,
              displayName: user.displayName,
              userId: user._id,
              xp: user.xp,
              role: user.role,
            };
            return userRank;
          }
          return null;
        })
        .filter((element) => element)
        .sort((a, b) => b.xp - a.xp)
        .map((item, index) => {
          return {
            ...item,
            orderNumber: index + 1,
          };
        });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async renewAllFollowings() {
    try {
      const backups = await this.followingModel.find({});
      await this.followingModel.deleteMany();
      const items = await this.followingModel.insertMany(backups);
      return {
        success: true,
        n: items.length,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  public getFollowingsOtherUser(userId: string, currentPage: number) {
    const nPerPage = 15;
    const nSkip = currentPage <= 0 ? 0 : (currentPage - 1) * nPerPage;
    const followUserRef = ['displayName', 'avatar', 'xp'];
    const unSelect = ['-__v', '-tags', '-user'];
    const total$ = from(this.countFollowings(userId));
    return forkJoin([
      total$,
      this.followingModel
        .find({
          user: Types.ObjectId(userId),
        })
        .skip(nSkip)
        .limit(nPerPage)
        .populate('followUser', followUserRef)
        .select(unSelect)
        .lean(),
    ]).pipe(
      map(([total, followings]) => {
        return {
          total: total.count,
          items: followings,
        };
      }),
    );
  }
  public async getAllFollowings(userId: string) {
    const user = await this.usersService.findById(userId);
    if (user && user.xp > 0) {
      const followUserRef = ['displayName', 'avatar', 'xp'];
      const unSelect = ['-__v', '-tags', '-user'];
      const followings = await this.followingModel
        .find({
          user: Types.ObjectId(userId),
        })
        .populate('followUser', followUserRef)
        .select(unSelect);
      if (followings?.length > 0) {
        const higherScoreUsers = followings.filter((item) => {
          const followUser = item.followUser as unknown as UserDocument;
          return followUser?.xp > user.xp;
        });
        if (higherScoreUsers?.length > 0) {
          return {
            currentUser: userId,
            followings: higherScoreUsers,
          };
        }
      }
    }
  }
}
