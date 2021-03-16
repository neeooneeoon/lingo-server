import { Body, Controller, Get, Post, UseGuards, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/authentication/jwt-auth.guard';
import { UserCtx } from 'src/common/custom.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
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
  @Patch('/profile/edit')
  @ApiQuery({name: 'email', type: String})
  updateUserProfile(@Query('email')email: string) {
  }

}
