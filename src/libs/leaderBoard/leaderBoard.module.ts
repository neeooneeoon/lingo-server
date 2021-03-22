import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaderBoardSchema, LeaderBoard } from './schema/leaderBoard.schema';
import { LeaderBoardService } from './leaderBoard.service';
import { LeaderBoardController } from './leaderBoard.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: LeaderBoard.name, schema: LeaderBoardSchema }
        ])
    ],
    providers: [LeaderBoardService],
    controllers: [LeaderBoardController],
    exports: [LeaderBoardService]
})
export class LeaderBoardModule {}