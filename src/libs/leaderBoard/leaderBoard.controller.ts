import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/authentication/jwt-auth.guard';
import { UserCtx } from 'src/common/custom.decorator';
import { UserContext } from 'src/helper/type';
import { LeaderBoardService } from './leaderBoard.service';
import { Rank } from './schema/leaderBoard.schema';

@ApiTags('leader board')
@ApiBearerAuth()
@Controller('api/leaderboard')
export class LeaderBoardController {
    constructor(
        private readonly leaderBoardService: LeaderBoardService
    ) {

    }
    @UseGuards(JwtAuthGuard)
    @Get('/')
    @ApiQuery({ enum: ["Legend", "Diamond", "Gold", "Silver", "Bronze", "None"], name: 'rank' })
    getLeaderBoardByRank(@UserCtx('user')user: UserContext, @Query('rank') rank: Rank) {
        return this.leaderBoardService.getLeaderBoard(user.userId, rank)
    }

}