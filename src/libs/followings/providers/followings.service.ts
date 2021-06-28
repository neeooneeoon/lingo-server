import { Model, Types } from 'mongoose';
import { Following, FollowingDocument } from "@entities/following.entity";
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UsersService } from '@libs/users/providers/users.service';

@Injectable()
export class FollowingsService {
    constructor(
        @InjectModel(Following.name) private followingModel: Model<FollowingDocument>,
        @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    ) { }

    public async getListFollowings(currentUser: Types.ObjectId) {
        try {
            const listFollowings = await this.followingModel.find({
                user: currentUser
            })
                .select('-__v')
                .populate('followUser', ['displayName', 'avatar', 'xp'])
                .populate('tag', ['color', 'name']);

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

}