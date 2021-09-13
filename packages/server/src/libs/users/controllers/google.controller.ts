import {
  Controller,
  Get,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GoogleService } from '../providers/google.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Login')
@Controller('google')
export class GoogleController {
  constructor(private googleService: GoogleService) {
    return;
  }

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(): Promise<void> {
    return;
  }

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google chuyển hướng xác thực, nhận accessToken' })
  googleAuthRedirect(@Req() req: any): any {
    if (process.env.NODE_ENV !== 'production') {
      return this.googleService.googleRedirect(req);
    }
    throw new NotFoundException();
  }
}
