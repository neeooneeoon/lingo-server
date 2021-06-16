import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserProfile } from '@dto/user/userProfile.dto';
import { SuccessResponse } from '@utils/types';
import { UsersService } from '@providers/users.service';

@ApiTags('User')
@Controller('api/user')
export class UserController {
    constructor(private readonly usersService: UsersService) {}
    
    @Get('profile')
    getUserProfile() {

    }
}