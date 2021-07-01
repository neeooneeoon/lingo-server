import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { UserCtx } from "@utils/decorators/custom.decorator";
import { Rank, RankingByTime } from "@utils/enums";
import { JwtPayLoad } from "@utils/types";
import { LeaderBoardsService } from "./leaderBoards.service";
@ApiBearerAuth()
@ApiTags('LeaderBoards')
@Controller('api/leaderboard')
export class LeaderBoardsController {

    constructor(
        private leaderBoardsService: LeaderBoardsService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get('/')
    @ApiOperation({summary: "Lấy dữ liệu của bảng xếp hạng bằng rank"})
    @ApiParam({type: String, enum: Rank, name: 'rank'})
    async leaderBoardByRank(@Param('rank')rank: Rank, @UserCtx()user: JwtPayLoad) {
        return this.leaderBoardsService.getLeaderBoard(user.userId, rank);
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('ranking/bytime')
    @ApiOperation({summary: "Lấy danh sách xếp hạng theo thời gian tuần, tháng"})
    @ApiQuery({type: String, name: 'time', enum: RankingByTime})
    async getRanksByTime(@Query('time') timeSelect: string, @UserCtx()user: JwtPayLoad) {
        return this.leaderBoardsService.getRanksByTime(user.userId, timeSelect);
    }

    // @Post('/generate/rank-data')
    // async generateRank(): Promise<any>{
    //     return this.leaderBoardsService.generateRank();
    // }

    // @Post('/add-user')
    // async addUser(): Promise<any> {
    //     return this.leaderBoardsService.addUser();
    // }
}