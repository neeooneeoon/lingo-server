import { Controller, Post, Body, ForbiddenException } from '@nestjs/common';
import { AppleService } from '../providers/apple.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AppleLoginDto } from '@dto/user';

@ApiTags('Login')
@Controller()
export class AppleController {
  constructor(private readonly appleService: AppleService) {}
  @Post('/apple')
  @ApiBody({ type: AppleLoginDto })
  public async appleLogin(@Body() payload: any): Promise<any> {
    console.log('Received', payload);
    if (!payload.code) {
      throw new ForbiddenException();
    }

    return this.appleService.verifyUser(payload);
  }
}
