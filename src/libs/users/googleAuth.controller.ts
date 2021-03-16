import {
    Controller, Get, Post, Req,
    UseGuards, Body
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { LoginGoogle } from './dto/login-google.dto';

@ApiTags('google')
@Controller('google')
export class GoogleAuthentication {
    constructor(private readonly userService: UsersService) { }

    @Get()
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) { }

    @Get('redirect')
    @UseGuards(AuthGuard('google'))
    googleAuthRedirect(@Req() req) {
        return this.userService.googleLogin(req)
    }

    @Post('login')
    @ApiBody({ type: LoginGoogle })
    loginWithGoogle(@Body() body: LoginGoogle) {
        const { access_token } = body;
        return this.userService.googleLoginServerHandle(access_token)
    }

}