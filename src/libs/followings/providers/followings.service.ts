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
            .populate('followUser', ['displayName', 'avatar', 'xp']);
            const result = listFollowings.map(item => {
                if (item.tag) {
                    return item.populate('tag');
                }
                return item;
            });
            return result;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async startFollow(currentUser: string, followUser: string, tagId?: string): Promise<string> {
        try {
            if (currentUser === followUser) {
                throw new BadRequestException('You can not follow yourself');
            }

            const listFollowings = (await this.followingModel.find({
                user: currentUser
            })).map(item => item.user);
            if (!listFollowings || !listFollowings.includes(Types.ObjectId(followUser))) {
                const existsUser = await this.usersService.queryMe(followUser);
                if (!existsUser) {
                    throw new BadRequestException(`Can't find user ${followUser}`);
                }
                else {
                    const addingResult = await this.followingModel.create({
                        user: Types.ObjectId(currentUser),
                        followUser: Types.ObjectId(followUser),
                        tag: tagId ? Types.ObjectId(tagId) : ''
                    });
                    if (!addingResult) {
                        throw new BadRequestException('Error');
                    }
                    return 'Follow success';
                }
            }

        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException(error);
        }
    }

    public async unFollow(currentUser: Types.ObjectId, followedUser: Types.ObjectId): Promise<FollowingDocument> {
        try {
            return await this.followingModel.findOneAndUpdate(
                { user: currentUser },
                { $pullAll: { listFollowing: [followedUser] } },
                { new: true }
            )
            .populate('followUser', ['displayName', 'xp', 'avatar'])
            .populate('listFollowing.tag', ['name', 'color']);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

}