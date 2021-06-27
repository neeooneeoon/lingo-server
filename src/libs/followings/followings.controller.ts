import { Types } from 'mongoose';
import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { AddFollowingDto } from "@dto/following";
import { Body, Controller, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { UserCtx } from "@utils/decorators/custom.decorator";
import { JwtPayLoad } from "@utils/types";
import { FollowingsService } from "./followings.service";

@ApiBearerAuth()
@ApiTags('Followings')
@Controller('api/followings')
export class FollowingsController {

    constructor (
        private followingsService: FollowingsService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('add')
    @ApiOperation({summary: 'Theo dõi người dùng'})
    @ApiBody({type: AddFollowingDto})
    async addUserToListFollowing(@Body()body: AddFollowingDto, @UserCtx() user: JwtPayLoad) {
        const followObjectId = Types.ObjectId(body.followId);
        const userObjectId = Types.ObjectId(user.userId);
        return this.followingsService.startFollow(userObjectId, followObjectId);
    }

    @UseGuards(JwtAuthGuard)
    @Put('unFollow/:id')
    @ApiParam({type: 'string', required: true, description: 'Id người đang theo dõi', name: 'id'})
    @ApiOperation({summary: 'Hủy theo dõi người dùng'})
    async unFollowUser(@Param('id') id: string, @UserCtx() user: JwtPayLoad) {
        const userObjectId = Types.ObjectId(user.userId);
        const followedUserObjectId = Types.ObjectId(String(id));
        return this.followingsService.unFollow(userObjectId, followedUserObjectId);
    }

}