import { LoginBodyDto } from "@dto/user";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UsersService } from "../providers/users.service";
import { UserLogin } from '@dto/user/userLogin.dto';

@ApiTags("Login")
@Controller("api/login")
export class LoginController {
    constructor(
        private usersService: UsersService
    ) {}


    @Post("google")
    @ApiBody({type: LoginBodyDto, description: "Access token from /google/redirect response"})
    @ApiOperation({summary: "Login thông qua accessToken của Google"})
    loginWithGoogleAccount(@Body() body: LoginBodyDto): Promise<UserLogin> {
        const {
            access_token: accessToken
        } = body;
        return this.usersService.googleLoginHandle(accessToken);
    }


    @Post("facebook")
    @ApiBody({type: LoginBodyDto, description: "Access token from /facebook/redirect response"})
    @ApiOperation({summary: "Login thông qua accessToken của Facebook"})
    loginWithFacebookAccount(@Body() body: LoginBodyDto) {
        const {
            access_token: accessToken
        } = body;
        return this.usersService.facebookLoginHandle(accessToken);
    }


}