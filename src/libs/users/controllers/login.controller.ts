import { LoginBodyDto } from "@dto/user";
import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UsersService } from "../providers/users.service";
import { UserLogin } from '@dto/user/userLogin.dto';
import { LoginResultDto } from "@dto/user/loginResult.dto";

@ApiTags("Login")
@Controller("api/login")
export class LoginController {
    constructor(
        private usersService: UsersService
    ) {}


    @Post("google")
    @ApiBody({type: LoginBodyDto, description: "Access token from /google/redirect response"})
    @ApiOperation({summary: "Login thông qua accessToken của Google"})
    @ApiResponse({type: LoginResultDto, status: 201})
    loginWithGoogleAccount(@Body() body: LoginBodyDto): Promise<UserLogin> {
        const {
            access_token: accessToken
        } = body;
        return this.usersService.googleLoginHandle(accessToken);
    }


    @Post("facebook")
    @ApiBody({type: LoginBodyDto, description: "Access token from /facebook/redirect response"})
    @ApiOperation({summary: "Login thông qua accessToken của Facebook"})
    @ApiResponse({type: LoginResultDto, status: 201})
    loginWithFacebookAccount(@Body() body: LoginBodyDto) {
        const {
            access_token: accessToken
        } = body;
        return this.usersService.facebookLoginHandle(accessToken);
    }


}