import { Model, Types } from 'mongoose';
import { Following, FollowingDocument } from "@entities/following.entity";
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UsersService } from '@libs/users/providers/users.service';

@Injectable()
export class FollowingsService {
    constructor(
        @InjectModel(Following.name) private followingModel: Model<FollowingDocument>,
        @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    ) { }

    public async createEmptyFollowing(userId: string): Promise<FollowingDocument> {
        try {
            return this.followingModel.create({
                user: Types.ObjectId(userId),
                listFollowing: []
            });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async findOne(currentUser: Types.ObjectId): Promise<FollowingDocument> {
        try {
            const instance = await this.followingModel.findOne({
                user: currentUser
            });
            if (!instance) {
                throw new NotFoundException('Not found');
            }
            return instance
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async startFollow(currentUser: Types.ObjectId, followUser: Types.ObjectId): Promise<FollowingDocument> {
        try {
            if (currentUser.equals(followUser)) {
                throw new BadRequestException('You can not follow yourself');
            }
            const instanceFollowing = await this.findOne(currentUser);
            const existsUser = await this.usersService.queryMe(followUser);

            if (!existsUser) {
                throw new BadRequestException(`Can't not find user with ${followUser}`);
            }
            const listUserFollowing = instanceFollowing.listFollowing.map(item => item.user);
            if (listUserFollowing.includes(followUser)) {
                throw new BadRequestException('Already following this user');
            }
            return await this.followingModel.findOneAndUpdate(
                { user: currentUser },
                { $push: { listFollowing: {followUser: followUser, tag: ''} } },
                {new: true}
            )
            .populate('listFollowing.followUser', ['displayName', 'xp', 'avatar'])
            .populate('listFollowing.tag', [''])

        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async unFollow(currentUser: Types.ObjectId, followedUser: Types.ObjectId): Promise<FollowingDocument> {
        try {
            return await this.followingModel.findOneAndUpdate(
                { user: currentUser },
                { $pullAll: { listFollowing: [followedUser] } },
                { new: true }
            ).populate('listFollowing', ['displayName', 'xp', 'avatar'])
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

}