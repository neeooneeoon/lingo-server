import { Model, Types } from 'mongoose';
import { Following, FollowingDocument } from "@entities/following.entity";
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UsersService } from '@libs/users/providers/users.service';
import { TagsService } from './tags.service';
import { TagDocument } from '@entities/tag.entity';
import { from, Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

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
            );
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
                const following = await this.followingModel.findOne({
                    user: Types.ObjectId(currentUser),
                    _id: Types.ObjectId(followId)
                })

                const assignedTags = following.tags;
                if (!following) {
                    throw new BadRequestException(`Can't find following`);
                }
                if (assignedTags.includes(tagId) === true) {
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
                else if (assignedTags.length >= 3) {
                    throw new BadRequestException('Chỉ được gán tối đa 3 thẻ cho một người dùng')
                }
                const tag = await this.tagsService.findTag(currentUser, formattedTagId);
                const result = await this.followingModel.updateOne(
                    {
                        user: Types.ObjectId(currentUser),
                        _id: Types.ObjectId(followId),
                    },
                    {
                        $push: {
                            tags: tag._id
                        }
                    }
                )
                if (result.nModified === 1) {
                    return 'Assign tag success';
                }
            }
            else {
                const result = await this.followingModel.updateOne(
                    {
                        user: Types.ObjectId(currentUser),
                        _id: Types.ObjectId(followId),
                    },
                    {
                        $set: {
                            tag: ''
                        }
                    }
                )
                if (result.nModified === 1) {
                    return 'Assign tag success';
                }
            }
            throw new BadRequestException('Assign tag failed');
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException(error);
        }
    }

    public async 

}