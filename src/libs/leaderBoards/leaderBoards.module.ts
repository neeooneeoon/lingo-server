import { LeaderBoard, LeaderBoardSchema } from "@entities/leaderBoard.entity";
import { ScoreStatistic, ScoreStatisticShema } from "@entities/scoreStatistic.entity";
import { User, UserSchema } from "@entities/user.entity";
import { UsersModule } from "@libs/users";
import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LeaderBoardsController } from "./leaderBoards.controller";
import { LeaderBoardsService } from "./leaderBoards.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: LeaderBoard.name, schema: LeaderBoardSchema},
            {name: ScoreStatistic.name, schema: ScoreStatisticShema},
            {name: User.name, schema: UserSchema}
        ]),
        forwardRef(() => UsersModule)
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