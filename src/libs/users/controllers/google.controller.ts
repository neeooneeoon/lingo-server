import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UsersService } from "@providers/users.service";

@ApiTags('Google Login')
@Controller('google')
export class GoogleController {
    constructor(private usersService: UsersService) {}
}