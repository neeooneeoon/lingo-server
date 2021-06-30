import { Model, Types } from 'mongoose';
import { Following, FollowingDocument } from "@entities/following.entity";
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UsersService } from '@libs/users/providers/users.service';
import { TagsService } from './tags.service';
import { TagDocument } from '@entities/tag.entity';
import { UserProfile } from '@dto/user';

@Injectable()
export class FollowingsService {
    constructor(
        @InjectModel(Following.name) private followingModel: Model<FollowingDocument>,
        @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
        private readonly tagsService: TagsService,
    ) { }

    public async getListFollowings(currentUser: string, tagId: string) {
        try {
            const formattedTagId = tagId.trim();
            if (formattedTagId === 'all' || formattedTagId === 'ALL') {
                const listFollowings = await this.followingModel.find({
                    user: Types.ObjectId(currentUser),
                })
                    .select('-__v')
                    .populate('followUser', ['displayName', 'avatar', 'xp'])
                    .populate('tag', ['color', 'name']);

                return listFollowings;
            }
            const listFollowings = await this.followingModel.find({
                user: Types.ObjectId(currentUser),
                tag: { $in: [tagId] }
            })
                .select('-__v')
                .populate('followUser', ['displayName', 'avatar', 'xp'])
                .populate('tag', ['color', 'name']);

            return listFollowings;
        } catch (error) {
            throw new InternalServerErrorException(error);
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
            const tag = await this.tagsService.findTag(currentUser, tagId);
            const result = await this.followingModel.updateOne(
                {
                    user: Types.ObjectId(currentUser),
                    _id: Types.ObjectId(followId),
                },
                {
                    $set: {
                        tag: tag._id
                    }
                }
            )
            if (result.nModified === 1) {
                return 'Assign tag success';
            }
            throw new BadRequestException('Assign tag failed');
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

}