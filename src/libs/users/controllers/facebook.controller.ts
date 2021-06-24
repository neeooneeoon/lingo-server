import {
    Controller, Get,
    UseGuards, HttpStatus, Req,
} from "@nestjs/common";
import { Request } from "express";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Login")
@Controller("facebook")
export class FacebookController {


    @Get("/")
    @UseGuards(AuthGuard("facebook"))
    facebookAuth(): HttpStatus {
        return HttpStatus.OK;
    }


    @Get("/redirect")
    @UseGuards(AuthGuard("facebook"))
    @ApiOperation({summary: "Facebook chuyển hướng xác thực, nhận accessToken"})
    facebookAuthRedirect(@Req()req: Request): {statusCode: HttpStatus, data: Express.User} {
        return {
            statusCode: HttpStatus.OK,
            data: req.user
        }
    }
    

}