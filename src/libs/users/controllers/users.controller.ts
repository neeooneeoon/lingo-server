import {
    Body,
    Controller,
    Get,
    Patch,
    Query,
    Put,
    UseGuards,
} from "@nestjs/common";
import {
    ApiTags,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
    ApiOperation,
    ApiQuery,
} from "@nestjs/swagger";
import { UserProfile, UpdateUserDto, SaveLessonDto } from '@dto/user';
import { UsersService } from '../providers/users.service';
import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { UserCtx } from "@utils/decorators/custom.decorator";
import { JwtPayLoad } from "@utils/types";



@ApiTags('User')
@Controller('api/user')
export class UserController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: "Lấy thông tin người dùng" })
    @ApiConsumes('application/json')
    async getUserProfile(@UserCtx() user: JwtPayLoad): Promise<UserProfile> {
        return this.usersService.queryMe(user.userId)
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile/edit')
    @ApiBearerAuth()
    @ApiOperation({ summary: "Sửa đổi hồ sơ người dùng" })
    @ApiConsumes('application/json')
    @ApiBody({ type: UpdateUserDto, description: "Update Information" })
    async updateUserProfile(@UserCtx() user: JwtPayLoad, @Body() body: UpdateUserDto): Promise<UserProfile> {
        return this.usersService.updateUserProfile(user.userId, body)
    }

    @UseGuards(JwtAuthGuard)
    @Put('saveLesson')
    @ApiBearerAuth()
    @ApiOperation({ summary: "Lưu kết quả mỗi bài học" })
    @ApiConsumes('application/json')
    @ApiBody({ type: SaveLessonDto, required: true, description: "Kết quả bài học" })
    async saveUserLesson(@Body() input: SaveLessonDto, @UserCtx() user: JwtPayLoad): Promise<string> {
        return this.usersService.saveUserLesson(user, input);
    }

    @UseGuards(JwtAuthGuard)
    @Get('search')
    @ApiBearerAuth()
    @ApiOperation({summary: "TÌm kiếm người dùng theo email hoặc tên hiển thị"})
    @ApiConsumes('application/json')
    @ApiQuery({type: String, name: "search", required: true})
    async searchUser(@Query('search') search: string) {
        return this.usersService.searchUser(search);
    }
}