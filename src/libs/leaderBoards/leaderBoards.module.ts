import { LeaderBoard, LeaderBoardSchema } from "@entities/leaderBoard.entity";
import { ScoreStatistic, ScoreStatisticSchema } from "@entities/scoreStatistic.entity";
import { User, UserSchema } from "@entities/user.entity";
import { ScoreStatisticsModule } from "@libs/scoreStatistics/scoreStatistics.module";
import { UsersModule } from "@libs/users";
import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LeaderBoardsController } from "./leaderBoards.controller";
import { LeaderBoardsService } from "./leaderBoards.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: LeaderBoard.name, schema: LeaderBoardSchema},
            {name: ScoreStatistic.name, schema: ScoreStatisticSchema},
            {name: User.name, schema: UserSchema}
        ]),
        forwardRef(() => UsersModule),
        ScoreStatisticsModule
    ],
    controllers: [
        LeaderBoardsController,
    ],
    providers: [
        LeaderBoardsService,
    ],
    exports: [LeaderBoardsService]
})

export class LeaderBoardsModule { };