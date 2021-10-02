import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import {
  AddFollowingDto,
  AssignTagDto,
  FollowingUser,
  ViewFollowingsDto,
  CheckFollowing,
} from '@dto/following';
import { FriendsDto } from '@dto/following/friends.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserCtx } from '@utils/decorators/custom.decorator';
import { JwtPayLoad } from '@utils/types';
import { FollowersService } from '../providers/followers.service';
import { FollowingsService } from '../providers/followings.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Followings')
@Controller('api/followings')
export class FollowingsController {
  constructor(
    private followingsService: FollowingsService,
    private followersService: FollowersService,
  ) {}

  @Get('test')
  async group() {
    return this.followingsService.pushToCache();
  }

  @Post('add')
  @ApiOperation({ summary: 'Theo dõi người dùng' })
  @ApiBody({ type: AddFollowingDto })
  @ApiResponse({ type: FollowingUser, status: 201 })
  addUserToListFollowing(
    @Body() body: AddFollowingDto,
    @UserCtx() user: JwtPayLoad,
  ) {
    const { followId, tagId } = body;
    return this.followingsService.startFollow(user.userId, followId, tagId);
  }

  @Delete('unFollow/:id')
  @ApiParam({
    type: 'string',
    required: true,
    description: 'Id người đang theo dõi',
    name: 'id',
  })
  @ApiOperation({ summary: 'Hủy theo dõi người dùng' })
  @ApiResponse({ type: String, status: 200 })
  unFollowUser(@Param('id') id: string, @UserCtx() user: JwtPayLoad) {
    return this.followingsService.unFollow(user.userId, id);
  }

  @Get('/')
  @ApiOperation({ summary: 'Get followings' })
  @ApiQuery({ type: ViewFollowingsDto, name: 'tagIds', required: true })
  @ApiQuery({ type: Number, name: 'page', required: true })
  async viewFollowings(
    @Query('tagIds') tagIds: string[],
    @Query('page') page: number,
    @UserCtx() user: JwtPayLoad,
  ) {
    return this.followingsService.getMyFollowings(user.userId, tagIds, page);
  }

  @Put('assignTag')
  @ApiOperation({ summary: 'Găn thẻ người theo dõi' })
  @ApiBody({ type: AssignTagDto, required: true })
  async assignTag(@Body() body: AssignTagDto, @UserCtx() user: JwtPayLoad) {
    return this.followingsService.addTagToFollowingUser(
      user.userId,
      body.followingId,
      body.tagId,
    );
  }

  @Get('/:userId/followers')
  @ApiOperation({ summary: 'Followings và Followers' })
  @ApiParam({
    type: String,
    required: true,
    name: 'userId',
    description: 'Id user muốn xem followings và followers của user đó.',
  })
  @ApiQuery({ type: Number, required: true, name: 'page' })
  @ApiResponse({ type: FriendsDto })
  getFollowers(@Param('userId') userId: string, @Query('page') page: number) {
    return this.followersService.getFollowers(userId, page);
  }

  @Get('/:userId/followings')
  @ApiOperation({ summary: 'Followings và Followers' })
  @ApiParam({
    type: String,
    required: true,
    name: 'userId',
    description: 'Id user muốn xem followings và followers của user đó.',
  })
  @ApiQuery({ type: Number, required: true, name: 'page' })
  @ApiResponse({ type: FriendsDto })
  getFollowings(@Param('userId') userId: string, @Query('page') page: number) {
    return this.followingsService.getFollowingsOtherUser(userId, page);
  }

  @Get('/checkIsFollowing/:userId')
  @ApiParam({ type: String, name: 'userId', required: true })
  @ApiResponse({ type: CheckFollowing, status: 200 })
  checkIsFollowing(
    @Param('userId') userId: string,
    @UserCtx() user: JwtPayLoad,
  ) {
    return this.followingsService.checkIsFollowing(user.userId, userId);
  }
}
