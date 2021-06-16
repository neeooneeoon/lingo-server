import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { UsersService } from "@providers/users.service";
import { AuthGuard } from '@nestjs/passport';
import { LoginBodyDto } from '@dto/user/loginBody.dto';
import { UserLogin } from '@dto/user/userLogin.dto';

@ApiTags('User')
@Controller('google')
export class GoogleController {
    constructor(private usersService: UsersService) {}

    @Get()
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req()req: any): Promise<void> { }

    @Get('redirect')
    @UseGuards(AuthGuard('google'))
    googleAuthRedirect(@Req()req: any): any {
        return this.usersService.googleRedirect(req);
    }

    @Post('login')
    @ApiBody({ type: LoginBodyDto })
    loginWithGoogleAccessToken(@Body()body: LoginBodyDto): Promise<UserLogin> {
        const { accessToken } = body;
        return this.usersService.googleLoginHandle(accessToken);
    }
}