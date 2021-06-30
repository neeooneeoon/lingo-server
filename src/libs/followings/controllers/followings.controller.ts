import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { AddFollowingDto, AssignTagDto, ViewFollowingsDto } from "@dto/following";
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
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

    @Delete('unFollow/:id')
    @ApiParam({type: 'string', required: true, description: 'Id người đang theo dõi', name: 'id'})
    @ApiOperation({summary: 'Hủy theo dõi người dùng'})
    async unFollowUser(@Param('id') id: string, @UserCtx() user: JwtPayLoad) {
        return this.followingsService.unFollow(user.userId, id);
    }

    @Get('/')
    @ApiOperation({summary: 'Get followings'})
    @ApiQuery({type: ViewFollowingsDto, name: 'tagId', required: true})
    async viewFollowings(@Query('tagId') tagId: string,  @UserCtx() user: JwtPayLoad) {
        return this.followingsService.getListFollowings(user.userId, tagId);
    }

    @Put('assignTag')
    @ApiOperation({summary: 'Găn thẻ người theo dõi'})
    @ApiBody({type: AssignTagDto, required: true})
    async assignTag(@Body()body: AssignTagDto, @UserCtx() user: JwtPayLoad) {
        console.log(body);
        console.log(user);
        return this.followingsService.addTagToFollowingUser(user.userId, body.followingId, body.tagId);
    }

}