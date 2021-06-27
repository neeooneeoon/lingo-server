import { FollowingDocument } from '@entities/following.entity';
import { FollowingsService } from '@libs/followings/followings.service';
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Types } from "mongoose";
import { UsersService } from "./users.service";

@Injectable()
export class UserFollowingService {

    constructor(
        private usersService: UsersService,
        private followingsService: FollowingsService
    ) { }


    public async startFollowingUser(userId: Types.ObjectId, followId: Types.ObjectId): Promise<FollowingDocument> {
        try {
            if (userId.equals(followId)) {
                throw new BadRequestException("You can't follow yourself");
            }
            const existsUser = await this.usersService.queryMe(userId);
            if (!existsUser) {
                throw new BadRequestException(`Can't not find user with ${followId}`);
            }
            return this.followingsService.startFollowing(userId, followId);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

}