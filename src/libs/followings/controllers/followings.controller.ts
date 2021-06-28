import { Types } from 'mongoose';
import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { AddFollowingDto } from "@dto/following";
import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { UserCtx } from "@utils/decorators/custom.decorator";
import { JwtPayLoad } from "@utils/types";
import { FollowingsService } from "../providers/followings.service";

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Followings')
@Controller('api/followings')
export class FollowingsController {

    constructor (
        private followingsService: FollowingsService
    ) { }

    @Post('add')
    @ApiOperation({summary: 'Theo dõi người dùng'})
    @ApiBody({type: AddFollowingDto})
    async addUserToListFollowing(@Body()body: AddFollowingDto, @UserCtx() user: JwtPayLoad) {
        const { 
            followId,
            tagId
        } = body;
        return this.followingsService.startFollow(user.userId, followId, tagId);
    }

    @Put('unFollow/:id')
    @ApiParam({type: 'string', required: true, description: 'Id người đang theo dõi', name: 'id'})
    @ApiOperation({summary: 'Hủy theo dõi người dùng'})
    async unFollowUser(@Param('id') id: string, @UserCtx() user: JwtPayLoad) {
        const userObjectId = Types.ObjectId(user.userId);
        const followedUserObjectId = Types.ObjectId(String(id));
        return this.followingsService.unFollow(userObjectId, followedUserObjectId);
    }

    @Get('/')
    @ApiOperation({summary: 'Get followings'})
    async viewFollowings(@UserCtx() user: JwtPayLoad) {
        console.log(user)
        return this.followingsService.getListFollowings(Types.ObjectId(user.userId));
    }

}