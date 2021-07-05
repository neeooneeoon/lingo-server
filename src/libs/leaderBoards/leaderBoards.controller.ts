import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { ScoreStatisticsService } from "@libs/scoreStatistics/scoreStatistics.service";
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
        private scoreStatisticsService: ScoreStatisticsService
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
        return this.scoreStatisticsService.getRankByTime(user.userId, timeSelect)
    }


    @UseGuards(JwtAuthGuard)
    @Get('totalXp/thisWeek/:followUserId')
    @ApiOperation({summary: "Lấy điểm của user hiện tại và user follow tuần này"})
    @ApiParam({type: String, name: 'followUserId'})
    async getUserXpThisWeek(@UserCtx() user: JwtPayLoad, @Param('followUserId') followUserId: string) {
        return this.scoreStatisticsService.getUserXpThisWeek(user.userId, followUserId);
    }

    // @UseGuards(JwtAuthGuard)
    // @Post('test/addXp') 
    // async addXp() {
    //     return this.scoreStatisticsService.addXpAfterSaveLesson(15, '60d69b497562563750e9a5a1');
    //  }
    
    // @Post('/generate/rank-data')
    // async generateRank(): Promise<any>{
    //     return this.leaderBoardsService.generateRank();
    // }

    // @Post('/add-user')
    // async addUser(): Promise<any> {
    //     return this.leaderBoardsService.addUser();
    // }
}