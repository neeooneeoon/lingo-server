import { Model, Types } from 'mongoose';
import { Following, FollowingDocument } from "@entities/following.entity";
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UsersService } from '@libs/users/providers/users.service';
import { TagsService } from './tags.service';
import { TagDocument } from '@entities/tag.entity';
import { from, Observable } from "rxjs";

@Injectable()
export class FollowingsService {
    constructor(
        @InjectModel(Following.name) private followingModel: Model<FollowingDocument>,
        @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
        private readonly tagsService: TagsService,
    ) { }

    public getMyFollowings(currentUser: string, tagIds: string[], currentPage: number): Observable<FollowingDocument[]> {
        const nPerPage = 15;
        const nSkip = currentPage <= 0 ? 0 : (currentPage - 1) * nPerPage;
        const followUserRef = ['displayName', 'avatar', 'xp'];
        const tagRef = ['color', 'name'];
        const unSelect = ['-__v'];

        if (tagIds.includes('all')) {
            const followings$ = from(
                this.followingModel
                    .find({
                        user: Types.ObjectId(currentUser)
                    })
                    .skip(nSkip)
                    .limit(nPerPage)
                    .populate('followUser', followUserRef)
                    .populate('tags', tagRef)
                    .select(unSelect)
            )
            return followings$;
        }
        else {
            const followings$ = from(
                this.followingModel
                    .find({
                        user: Types.ObjectId(currentUser),
                        tags: {
                            $elemMatch: {
                                $in: tagIds
                            }
                        }
                    })
                    .skip(nSkip)
                    .limit(nPerPage)
                    .populate('followUser', followUserRef)
                    .populate('tags', tagRef)
                    .select(unSelect)
            );
            return followings$;
        }
    }

    public async followings(currentUser: string) {
        try {
            const listFollowings = await this.followingModel.find({
                user: Types.ObjectId(currentUser)
            });
            return listFollowings;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async startFollow(currentUser: string, followUser: string, tagId?: string): Promise<string> {
        try {
            if (currentUser === followUser) {
                throw new BadRequestException('You can not follow yourself');
            }
            const listFollowings = await this.followingModel.find({
                user: Types.ObjectId(currentUser)
            });
            const followingIds = listFollowings.map(item => item.followUser.toHexString());
            if (!followingIds || !followingIds.includes(followUser)) {
                const existsUser = await this.usersService.queryMe(followUser);
                if (!existsUser) {
                    throw new BadRequestException(`Can't find user ${followUser}`);
                }
                let existsTag: TagDocument;
                if (tagId) {
                    existsTag = await this.tagsService.findTag(currentUser, tagId);
                }
                const addingResult = await this.followingModel.create({
                    user: Types.ObjectId(currentUser),
                    followUser: Types.ObjectId(followUser),
                    tag: existsTag ? existsTag._id : ''
                });
                if (!addingResult) {
                    throw new BadRequestException('Follow failed');
                }
                return 'Follow success';
            }
            else if (followingIds && followingIds.includes(followUser)) {
                throw new BadRequestException('Already follow this user');
            }

        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async unFollow(currentUser: string, followedUser: string): Promise<void> {
        try {
            const result = await this.followingModel.deleteOne({
                user: Types.ObjectId(currentUser),
                followUser: Types.ObjectId(followedUser)
            });
            if (result.deletedCount === 1) {
                return;
            }
            else {
                throw new InternalServerErrorException('Error');
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async addTagToFollowingUser(currentUser: string, followId: string, tagId: string): Promise<string> {
        try {
            const formattedTagId = tagId.trim();
            if (formattedTagId) {
                const allTagPromise = this.tagsService.viewTags(currentUser);
                const followingPromise = this.followingModel.findOne({
                    user: Types.ObjectId(currentUser),
                    _id: Types.ObjectId(followId)
                });

                const [listUserTags, following] = await Promise.all([allTagPromise, followingPromise]);
                if (!following || !listUserTags || listUserTags.length === 0) {
                    throw new BadRequestException('No user tag, not found user following');
                }
                const userTagIds = listUserTags.map(item => String(item._id));
                let assignedTags = following.tags;
                const deleteTags = assignedTags.filter(item => !userTagIds.includes(item));

                if (!userTagIds.includes(tagId)) {
                    throw new BadRequestException(`Can't find tag`)
                }

                if (!following) {
                    throw new BadRequestException(`Can't find following`);
                }
                if (deleteTags.length > 0) {
                    const updated = await this.followingModel.findOneAndUpdate(
                        {
                            _id: Types.ObjectId(followId)
                        },
                        {
                            $pullAll: {
                                tags: deleteTags
                            },
                        },
                        { new: true }
                    );
                    assignedTags = updated.tags;
                }
                if (assignedTags.includes(tagId)) {
                    const updateResult = await this.followingModel.updateOne(
                        {
                            _id: Types.ObjectId(followId)
                        },
                        {
                            $pullAll: {
                                tags: [tagId]
                            }
                        }
                    )
                    if (updateResult.nModified === 1) {
                        return 'Un-assign tag success';
                    }
                }
                else {
                    if (assignedTags.length >= 3) {
                        throw new BadRequestException('Chỉ được gán tối đa 3 thẻ cho một người dùng')
                    }
                    const updateResult = await this.followingModel.updateOne(
                        {
                            _id: Types.ObjectId(followId)
                        },
                        {
                            $push: {
                                tags: tagId
                            }
                        }
                    )
                    if (updateResult.nModified === 1) {
                        return 'Assign tag success';
                    }
                }
            }
            throw new BadRequestException('Assign tag failed');
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException(error);
        }
    }

    public async checkIsFollowing(currentUserId: string, userId: string) {
        const listFollowings = await this.followings(currentUserId);
        const followUserIds = listFollowings.map(item => String(item.followUser));
        if (followUserIds.includes(userId)) {
            return true;
        }
        return false;
    }
}