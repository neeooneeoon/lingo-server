import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { GoogleService } from "../providers/google.service";
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Login')
@Controller('google')
export class GoogleController {
    constructor(private googleService: GoogleService) {}


    @Get()
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req()req: any): Promise<void> { }


    @Get('redirect')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({summary: "Google chuyển hướng xác thực, nhận accessToken"})
    googleAuthRedirect(@Req()req: any): any {
        return this.googleService.googleRedirect(req);
    }
    

}