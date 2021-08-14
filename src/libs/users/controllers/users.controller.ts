import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Put,
  UseGuards,
  Param,
  Delete,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import {
  UserProfile,
  UpdateUserDto,
  SaveLessonDto,
  SearchUser,
  ChangeAddressDto,
  ToggleNotificationDto,
  ToggleNotificationRes,
} from '@dto/user';
import { UsersService } from '../providers/users.service';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { UserCtx } from '@utils/decorators/custom.decorator';
import { JwtPayLoad } from '@utils/types';
import { ScoreOverviewDto } from '@dto/progress';
import { UserAddressService } from '@libs/users/providers/userAddress.service';
import { MailService } from 'src/mail/mail.service';
import { InvitationService } from '../providers/invitation.service';
import { MailInputDto } from '@dto/mail/mailInput.dto';

@ApiTags('User')
@Controller('api/user')
export class UserController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userAddressService: UserAddressService,
    private readonly invitationService: InvitationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng' })
  @ApiConsumes('application/json')
  @ApiResponse({ type: UserProfile, status: 200 })
  async getUserProfile(@UserCtx() user: JwtPayLoad) {
    return this.usersService.findUser(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/edit')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sửa đổi hồ sơ người dùng' })
  @ApiConsumes('application/json')
  @ApiBody({ type: UpdateUserDto, description: 'Update Information' })
  @ApiResponse({ type: UserProfile, status: 200 })
  async updateUserProfile(
    @UserCtx() user: JwtPayLoad,
    @Body() body: UpdateUserDto,
  ): Promise<UserProfile> {
    return this.usersService.updateUserProfile(user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('saveLesson')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lưu kết quả mỗi bài học' })
  @ApiConsumes('application/json')
  @ApiBody({
    type: SaveLessonDto,
    required: true,
    description: 'Kết quả bài học',
  })
  @ApiResponse({ type: String, status: 200 })
  async saveUserLesson(
    @Body() input: SaveLessonDto,
    @UserCtx() user: JwtPayLoad,
  ) {
    return this.usersService.saveUserLesson(user, input);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'TÌm kiếm người dùng theo email hoặc tên hiển thị' })
  @ApiConsumes('application/json')
  @ApiQuery({ type: String, name: 'search', required: true })
  @ApiQuery({ type: Number, name: 'page', required: true })
  @ApiResponse({ type: [SearchUser], status: 200 })
  async searchUser(
    @Query('search') search: string,
    @UserCtx() user: JwtPayLoad,
    @Query('page') pageNumber: number,
  ) {
    return this.usersService.searchUser(search, user.userId, pageNumber);
  }

  @Get('/:userId/scoreOverview')
  @ApiParam({ type: String, name: 'userId', required: true })
  @ApiOperation({ summary: 'Thống kê các đầu điểm của người dùng' })
  @ApiResponse({ type: ScoreOverviewDto, status: 200 })
  public scoresOverview(@Param('userId') userId: string) {
    return this.usersService.scoresOverview(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('changeAddress')
  @ApiBody({ type: ChangeAddressDto, required: true })
  @ApiResponse({ type: UserProfile, status: 200 })
  @ApiBearerAuth()
  changeUserAddress(
    @Body() body: ChangeAddressDto,
    @UserCtx() user: JwtPayLoad,
  ) {
    return this.userAddressService.changeUserAddress({
      currentUser: user.userId,
      provinceId: body.provinceId,
      districtId: body.districtId,
      schoolId: body.schoolId,
      grade: body.grade,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put('toggleNotification')
  @ApiBearerAuth()
  @ApiBody({ type: ToggleNotificationDto })
  @ApiResponse({ type: ToggleNotificationRes })
  @ApiOperation({ summary: 'Bật / tắt nhận thông báo ứng dụng' })
  toggleNotification(
    @Body() body: ToggleNotificationDto,
    @UserCtx() user: JwtPayLoad,
  ) {
    return this.usersService.toggleReceiveNotification(
      user.userId,
      body.enable,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('send/invitation/mail')
  @ApiBearerAuth()
  @ApiBody({ type: MailInputDto })
  @ApiOperation({ summary: 'Gửi mail mời người khác sử dụng ứng dụng' })
  invite(@Body('email') email: string, @UserCtx() user: JwtPayLoad) {
    return this.invitationService.sendInvitation(email, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout')
  @ApiBearerAuth()
  logout(@UserCtx() user: JwtPayLoad) {
    return this.usersService.logout(user.userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('test/get/image')
  getImg() {
    return {
      image: `http://localhost:8080/public/logo.jpg`,
    };
  }
}
