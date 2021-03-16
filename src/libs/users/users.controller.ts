import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/authentication/jwt-auth.guard';
import { UserCtx } from 'src/common/custom.decorator';
import { UserDocument } from './schema/user.schema';
@ApiTags('users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/login')
  login() {
    return this.usersService.login();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/query/me')
  @ApiBearerAuth()
  @ApiConsumes('application/json')
  queryMe(@UserCtx('user')user: UserDocument) {
    return user;
  }
}
