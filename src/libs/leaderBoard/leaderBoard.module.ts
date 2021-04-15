import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeaderBoardSchema, LeaderBoard } from './schema/leaderBoard.schema';
import { LeaderBoardService } from './leaderBoard.service';
import { LeaderBoardController } from './leaderBoard.controller';
import { UsersModule } from 'src/libs/users/users.module';
import { User, UserSchema } from 'src/libs/users/schema/user.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: LeaderBoard.name, schema: LeaderBoardSchema }
        ]),
        UsersModule,
        AuthenticationModule

    ],
    providers: [LeaderBoardService],
    controllers: [LeaderBoardController],
    exports: [LeaderBoardService]
})
export class LeaderBoardModule {}