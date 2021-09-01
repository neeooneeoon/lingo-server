import { LoginBodyDto } from '@dto/user';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserLogin } from '@dto/user/userLogin.dto';
import { LoginResultDto } from '@dto/user/loginResult.dto';
import { LoginService } from '../providers/login.service';

@ApiTags('Login')
@Controller('api/login')
export class LoginController {
  constructor(private loginService: LoginService) {}

  @Post('google')
  @ApiBody({
    type: LoginBodyDto,
    description: 'Access token from /google/redirect response',
  })
  @ApiOperation({ summary: 'Login thông qua accessToken của Google' })
  @ApiResponse({ type: LoginResultDto, status: 201 })
  loginWithGoogleAccount(@Body() body: LoginBodyDto): Promise<UserLogin> {
    return this.loginService.loginWithGoogle(body);
  }

  @Post('facebook')
  @ApiBody({
    type: LoginBodyDto,
    description: 'Access token from /facebook/redirect response',
  })
  @ApiOperation({ summary: 'Login thông qua accessToken của Facebook' })
  @ApiResponse({ type: LoginResultDto, status: 201 })
  loginWithFacebookAccount(@Body() body: LoginBodyDto) {
    return this.loginService.loginWithFacebook(body);
  }

  @Post('apple')
  @ApiBody({
    type: LoginBodyDto,
    description: 'Login with appleID, please share email and name',
  })
  @ApiResponse({ type: LoginResultDto, status: 201 })
  @ApiOperation({ summary: 'Login thông qua appleID' })
  loginWithAppleId(@Body() body: LoginBodyDto) {
    return this.loginService.loginWithApple(body);
  }
}
