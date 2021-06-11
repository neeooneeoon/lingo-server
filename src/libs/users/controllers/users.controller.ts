import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserProfile } from 'src/dto/libs/users/dto/userProfile.dto';
import { SuccessResponse } from '@utils/types';
import { UsersService } from '@providers/users.service';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly usersService: UsersService) {}
    
    @Get('profile')
    getUserProfile() {

    }
}