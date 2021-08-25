import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { ScoreStatisticsService } from '@libs/scoreStatistics/scoreStatistics.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserCtx } from '@utils/decorators/custom.decorator';
import { Action, Location, Rank, RankingByTime } from '@utils/enums';
import { JwtPayLoad } from '@utils/types';
import { LeaderBoardsService } from './leaderBoards.service';
import { PoliciesGuard } from '@middlewares/policy/policy.guard';
import { CheckPolicies } from '@middlewares/policy/policy.decorator';
import { UserPermission } from '@middlewares/policy/permissions/user.permission';
import { CreateRecordDto } from '@dto/leaderBoard/createRecord.dto';

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
  @ApiQuery({
    type: Boolean,
    name: 'displayFollowings',
    required: true,
    description: 'Lựa chọn có hiển thị danh sách theo dõi hay không',
  })
  @ApiQuery({ type: String, name: 'location', enum: Location, required: false })
  @ApiQuery({ type: Number, name: 'locationId', required: false })
  @ApiQuery({ type: Number, name: 'schoolId', required: false })
  async getRanksByTime(
    @Query('time') timeSelect: string,
    @Query('displayFollowings') displayFollowings: boolean,
    @Query('location') location: Location,
    @Query('locationId') locationId: number,
    @Query('schoolId') schoolId: number,
    @UserCtx() user: JwtPayLoad,
  ) {
    return this.scoreStatisticsService.getRankByTime(
      user.userId,
      timeSelect,
      displayFollowings,
      location,
      locationId,
      schoolId,
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
  @Post('create/record')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(new UserPermission(Action.Manage))
  createRecord(@Body() body: CreateRecordDto) {
    return this.scoreStatisticsService.createRecord(body);
  }

  @UseGuards(JwtAuthGuard)
  @CheckPolicies(new UserPermission(Action.Manage))
  @Post('/adminUpdate')
  async adminUpdate() {
    await this.scoreStatisticsService.adminUpdate();
  }
}
