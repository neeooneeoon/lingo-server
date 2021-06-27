import { Model, NativeError, Types } from 'mongoose';
import { Following, FollowingDocument } from "@entities/following.entity";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class FollowingsService {
    constructor(
        @InjectModel(Following.name) private followingModel: Model<FollowingDocument>,
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

    public async getListFollowing(userId: string): Promise<FollowingDocument> {
        try {
            const userFollowing = await this.followingModel.findOne({
                user: Types.ObjectId(userId)
            });
            if (!userFollowing) {
                throw new BadRequestException(`Can't find following instance with ${userId}`);
            }
            return userFollowing;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async startFollowing(userId: Types.ObjectId, followingId: Types.ObjectId) {
        try {
            if (userId.equals(followingId)) {
                throw new BadRequestException('You can not follow yourself');
            }
            const instanceFollowing = await this.followingModel.findOne({
                user: userId
            });
            if (!instanceFollowing) {
                throw new BadRequestException(`Can't find followings ${userId}`);
            }
            if (instanceFollowing.listFollowing.includes(followingId)) {
                throw new BadRequestException('Already following this user');
            }
            return await this.followingModel.findOneAndUpdate(
                { user: userId },
                { $push: { listFollowing: followingId } },
                {new: true}
            ).populate('listFollowing', ['displayName', 'xp', 'avatar'])

        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}