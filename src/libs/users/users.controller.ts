import { Body, Controller, Get, Post, UseGuards, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/authentication/jwt-auth.guard';
import { UserCtx } from 'src/common/custom.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { SaveLessonDto } from './dto/save-lesson.dto';
@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    ) {}

  @Post('/login')
  login() {
    return this.usersService.login();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  @ApiBearerAuth()
  @ApiConsumes('application/json')
  queryMe(@UserCtx('user')user) {
    return this.usersService.queryMe(user.userId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('/profile/edit')
  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserDto, required: true })
  updateUserProfile(@UserCtx('user')user, @Body()body: UpdateUserDto) {
    return this.usersService.updateUser(body, user.userId)
  }


  @UseGuards(JwtAuthGuard)
  @Post('/saveLesson')
  @ApiBearerAuth()
  @ApiBody({ type: SaveLessonDto, required: true })
  saveLesson(@UserCtx('user')user, @Body()body: SaveLessonDto) {
    return this.usersService.saveUserLesson(user.userId, body)
  }

}
