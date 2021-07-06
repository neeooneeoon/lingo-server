import {
    Body,
    Controller,
    Get,
    Patch,
    Query,
    Put,
    UseGuards,
    Param,
} from "@nestjs/common";
import {
    ApiTags,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
    ApiOperation,
    ApiQuery,
    ApiParam,
    ApiResponse,
} from "@nestjs/swagger";
import { UserProfile, UpdateUserDto, SaveLessonDto, SearchUser } from '@dto/user';
import { UsersService } from '../providers/users.service';
import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { UserCtx } from "@utils/decorators/custom.decorator";
import { JwtPayLoad } from "@utils/types";
import { ScoreOverviewDto } from "@dto/progress";


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
    @ApiResponse({type: UserProfile, status: 200})
    async getUserProfile(@UserCtx() user: JwtPayLoad) {
        return this.usersService.queryMe(user.userId)
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile/edit')
    @ApiBearerAuth()
    @ApiOperation({ summary: "Sửa đổi hồ sơ người dùng" })
    @ApiConsumes('application/json')
    @ApiBody({ type: UpdateUserDto, description: "Update Information" })
    @ApiResponse({type: UserProfile, status: 200})
    async updateUserProfile(@UserCtx() user: JwtPayLoad, @Body() body: UpdateUserDto): Promise<UserProfile> {
        return this.usersService.updateUserProfile(user.userId, body)
    }

    @UseGuards(JwtAuthGuard)
    @Put('saveLesson')
    @ApiBearerAuth()
    @ApiOperation({ summary: "Lưu kết quả mỗi bài học" })
    @ApiConsumes('application/json')
    @ApiBody({ type: SaveLessonDto, required: true, description: "Kết quả bài học" })
    @ApiResponse({type: String})
    async saveUserLesson(@Body() input: SaveLessonDto, @UserCtx() user: JwtPayLoad): Promise<string> {
        return this.usersService.saveUserLesson(user, input);
    }

    @UseGuards(JwtAuthGuard)
    @Get('search')
    @ApiBearerAuth()
    @ApiOperation({summary: "TÌm kiếm người dùng theo email hoặc tên hiển thị"})
    @ApiConsumes('application/json')
    @ApiQuery({type: String, name: "search", required: true})
    @ApiResponse({type: [SearchUser], status: 200})
    async searchUser(@Query('search') search: string, @UserCtx()user: JwtPayLoad) {
        return this.usersService.searchUser(search, user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('viewProfile/:userId')
    @ApiBearerAuth()
    @ApiOperation({summary: 'Xem thông tin người dùng bất kỳ'})
    @ApiConsumes('application/json')
    @ApiParam({type: String, name: 'userId', required: true, description: 'Id người dùng'})
    viewUserProfile(@Param('userId') userId: string) {
    }

    @Get('/:userId/scoreOverview')
    @ApiParam({type: String, name: 'userId', required: true})
    @ApiOperation({summary: 'Thống kê các đầu điểm của người dùng'})
    @ApiResponse({type: ScoreOverviewDto, status: 200})
    public scoresOverview(@Param('userId') userId: string) {
        return this.usersService.scoresOverview(userId);
    }
    
}