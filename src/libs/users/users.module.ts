import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from '@authentication';
import { User, UserSchema } from '@entities/user.entity';
import { UsersService } from './providers/users.service';
import { GoogleService } from './providers/google.service';
import { GoogleController } from './controllers/google.controller';
import { FacebookController } from "./controllers/facebook.controller";
import { LoginController } from './controllers/login.controller';
import { UserController } from './controllers/users.controller';
import { UsersHelper } from '@helpers/users.helper';
import { FacebookService } from './providers/facebook.service';
import { BooksModule } from '@libs/books';
import { LeaderBoardsModule } from "@libs/leaderBoards";
import { FollowingsModule } from '@libs/followings';
import { ScoreStatistic, ScoreStatisticShema } from '@entities/scoreStatistic.entity';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: User.name,
                    schema: UserSchema
                },
                {
                    name: ScoreStatistic.name,
                    schema: ScoreStatisticShema
                }
            ]
        ),
        AuthenticationModule,
        BooksModule,
        forwardRef(() => LeaderBoardsModule),
        forwardRef(() => FollowingsModule),
    ],
    controllers: [
        UserController,
        GoogleController,
        FacebookController,
        LoginController,
    ],
    providers: [
        UsersService,
        UsersHelper,
        GoogleService,
        FacebookService,
    ],
    exports: [
        UsersService
    ]
})
export class UsersModule { };