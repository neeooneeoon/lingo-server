import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserProfile } from '@libs/users/dto/userProfile.dto';
import { Observable } from "rxjs";

@ApiTags('User')
@Controller('user')
export class UserController {
    
    @Get('profile')
    getUserProfile() {

    }
}