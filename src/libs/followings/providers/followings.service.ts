import { Model, Types } from 'mongoose';
import { Following, FollowingDocument } from "@entities/following.entity";
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UsersService } from '@libs/users/providers/users.service';
import { TagsService } from './tags.service';
import { TagDocument } from '@entities/tag.entity';
import { UserProfile } from '@dto/user';
import { FollowingsHelper } from '@helpers/followings.helper';

@Injectable()
export class FollowingsService {
    constructor(
        @InjectModel(Following.name) private followingModel: Model<FollowingDocument>,
        @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
        private readonly tagsService: TagsService,
        private readonly followingsHelper: FollowingsHelper,
    ) { }

    public async getListFollowings(currentUser: string) {
        try {
            const listFollowings = await this.followingModel.find({
                user: Types.ObjectId(currentUser)
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
                else {
                    const addingResult = await this.followingModel.create({
                        user: Types.ObjectId(currentUser),
                        followUser: Types.ObjectId(followUser),
                        tag: tagId ? tagId : ''
                    });
                    if (!addingResult) {
                        throw new BadRequestException('Error');
                    }
                    return 'Follow success';
                }
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

    public async addTagToFollowingUser(currentUser: string, followUser: string, tagId: string) {
        try {
            const findTagPromise = this.tagsService.findTag(currentUser, tagId);
            const verifyUserPromise = this.usersService.queryMe(followUser);

            let tagResult: TagDocument;
            let followUserResult: UserProfile;

            await Promise.all([findTagPromise, verifyUserPromise])
                .then(([resultOne, resultTwo]) => {
                    if (!resultOne) {
                        throw new NotFoundException(`Can't find tag with ${tagId}`);
                    }
                })
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

}