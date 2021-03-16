import { Controller, Get, UseGuards, HttpStatus, Req, Post, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { LoginFacebook } from './dto/login-facebook.dto';
import { UsersService } from './users.service';

@ApiTags('facebook')
@Controller('facebook')
export class FacebookAuthenticationController {

  constructor(private readonly userService: UsersService) {}

  @Get("/")
  @UseGuards(AuthGuard("facebook"))
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get("/redirect")
  @UseGuards(AuthGuard("facebook"))
  async facebookLoginRedirect(@Req() req: Request): Promise<any> {
    return {
      statusCode: HttpStatus.OK,
      data: req.user,
    };
  }

  @Post('/login')
  loginWithFacebook(@Body() body: LoginFacebook) {
    const { access_token } = body;
    return this.userService.facebookLoginServiceHandle(access_token)
  }
  

}