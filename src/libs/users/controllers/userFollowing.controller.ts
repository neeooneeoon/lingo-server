import { Types } from 'mongoose';
import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { AddFollowingDto } from "@dto/following";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserCtx } from "@utils/decorators/custom.decorator";
import { JwtPayLoad } from "@utils/types";
import { UserFollowingService } from "../providers/userFollowing.service";

@ApiBearerAuth()
@ApiTags('Followings')
@Controller('api/followings')
export class UserFollowingController {

    constructor (
        private readonly userFollowingService: UserFollowingService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('add')
    @ApiOperation({summary: 'Theo dõi người dùng'})
    @ApiBody({type: AddFollowingDto})
    async addUserToListFollowing(@Body()body: AddFollowingDto, @UserCtx() user: JwtPayLoad) {
        const followObjectId = Types.ObjectId(body.followId);
        const userObjectId = Types.ObjectId(user.userId);
        return this.userFollowingService.startFollowingUser(userObjectId, followObjectId);
    }

}