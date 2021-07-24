import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { ScoreStatisticsService } from '@libs/scoreStatistics/scoreStatistics.service';
import { Controller, Get, Param, Query, UseGuards, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserCtx } from '@utils/decorators/custom.decorator';
import { Location, Rank, RankingByTime } from '@utils/enums';
import { JwtPayLoad } from '@utils/types';
import { LeaderBoardsService } from './leaderBoards.service';
import { UserAddress } from '@dto/address/userAddress.dto';
@ApiBearerAuth()
@ApiTags('LeaderBoards')
@Controller('api/leaderboard')
export class LeaderBoardsController {
  constructor(
    private leaderBoardsService: LeaderBoardsService,
    private scoreStatisticsService: ScoreStatisticsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  @ApiOperation({ summary: 'Lấy dữ liệu của bảng xếp hạng bằng rank' })
  @ApiParam({ type: String, enum: Rank, name: 'rank' })
  async leaderBoardByRank(
    @Param('rank') rank: Rank,
    @UserCtx() user: JwtPayLoad,
  ) {
    return this.leaderBoardsService.getLeaderBoard(user.userId, rank);
  }

  @UseGuards(JwtAuthGuard)
  @Get('ranking/bytime')
  @ApiOperation({
    summary:
      'Lấy danh sách xếp hạng theo thời gian tuần, tháng, tất cả thời gian và theo vị trí',
  })
  @ApiQuery({ type: String, name: 'time', enum: RankingByTime })
  @ApiQuery({ type: String, name: 'location', enum: Location, required: false })
  @ApiQuery({ type: Number, name: 'locationId', required: false })
  async getRanksByTime(
    @Query('time') timeSelect: string,
    @Query('location') location: string,
    @Query('locationId') locationId: number,
    @UserCtx() user: JwtPayLoad,
  ) {
    return this.scoreStatisticsService.getRankByTime(
      user.userId,
      timeSelect,
      location,
      locationId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('totalXp/thisWeek/:followUserId')
  @ApiOperation({
    summary: 'Lấy điểm của user hiện tại và user follow tuần này',
  })
  @ApiParam({ type: String, name: 'followUserId' })
  async getUserXpThisWeek(
    @UserCtx() user: JwtPayLoad,
    @Param('followUserId') followUserId: string,
  ) {
    return this.scoreStatisticsService.getUserXpThisWeek(
      user.userId,
      followUserId,
    );
  }
}
