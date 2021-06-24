import { LeaderBoard, LeaderBoardSchema } from "@entities/leaderBoard.entity";
import { UsersModule } from "@libs/users";
import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LeaderBoardsController } from "./leaderBoards.controller";
import { LeaderBoardsService } from "./leaderBoards.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: LeaderBoard.name, schema: LeaderBoardSchema}
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