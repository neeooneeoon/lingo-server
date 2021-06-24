import { LeaderBoard, LeaderBoardSchema } from "@entities/leaderBoard.entity";
import { UsersModule } from "@libs/users";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LeaderBoardsController } from "./leaderBoards.controller";
import { LeaderBoardsService } from "./leaderBoards.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: LeaderBoard.name, schema: LeaderBoardSchema}
        ]),
        UsersModule
    ],
    controllers: [
        LeaderBoardsController,
    ],
    providers: [
        LeaderBoardsService,
    ],
    exports: []
})

export class LeaderBoardsModule { };