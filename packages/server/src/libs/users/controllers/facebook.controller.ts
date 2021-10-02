import { Controller, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Login')
@Controller('facebook')
export class FacebookController {
  @Get('/')
  @UseGuards(AuthGuard('facebook'))
  facebookAuth(): HttpStatus {
    return HttpStatus.OK;
  }

  // @Get('/redirect')
  // @UseGuards(AuthGuard('facebook'))
  // @ApiOperation({ summary: 'Facebook chuyển hướng xác thực, nhận accessToken' })
  // facebookAuthRedirect(@Req() req: Request): {
  //   statusCode: HttpStatus;
  //   data: Express.User;
  // } {
  //   return {
  //     statusCode: HttpStatus.OK,
  //     data: req.user,
  //   };
  // }
}
