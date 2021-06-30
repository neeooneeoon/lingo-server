import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { UserCtx } from "@utils/decorators/custom.decorator";
import { Rank } from "@utils/enums";
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

}