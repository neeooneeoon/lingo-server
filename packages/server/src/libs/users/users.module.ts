import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from '@authentication';
import { User, UserSchema } from '@entities/user.entity';
import { UsersService } from './providers/users.service';
import { GoogleService } from './providers/google.service';
import { GoogleController } from './controllers/google.controller';
import { FacebookController } from './controllers/facebook.controller';
import { LoginController } from './controllers/login.controller';
import { UserController } from './controllers/users.controller';
import { UsersHelper } from '@helpers/users.helper';
import { FacebookService } from './providers/facebook.service';
import { BooksModule } from '@libs/books';
import { LeaderBoardsModule } from '@libs/leaderBoards';
import { FollowingsModule } from '@libs/followings';
import {
  ScoreStatistic,
  ScoreStatisticSchema,
} from '@entities/scoreStatistic.entity';
import { ScoreStatisticsModule } from '@libs/scoreStatistics/scoreStatistics.module';
import { AddressModule } from '@libs/address';
import { UserAddressService } from '@libs/users/providers/userAddress.service';
import { NotificationsModule } from '@libs/notifications';
import { AppleService } from '@libs/users/providers/apple.service';
import { LoginService } from '@libs/users/providers/login.service';
import { UserScoresService } from '@libs/users/providers/userScores.service';
import { CacheModule } from '@cache';
import { ConnectModule } from '@connect';
import { MailModule } from 'src/mail/mail.module';
import { InvitationService } from './providers/invitation.service';
import { MailHelper } from '@helpers/mail.helper';
import { UserLessonService } from './providers/userLesson.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: ScoreStatistic.name,
        schema: ScoreStatisticSchema,
      },
    ]),
    AuthenticationModule,
    BooksModule,
    AddressModule,
    NotificationsModule,
    forwardRef(() => LeaderBoardsModule),
    forwardRef(() => FollowingsModule),
    forwardRef(() => ScoreStatisticsModule),
    CacheModule,
    ConnectModule,
    MailModule,
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
    MailHelper,
    GoogleService,
    FacebookService,
    UserAddressService,
    InvitationService,
    AppleService,
    LoginService,
    UserScoresService,
    UserLessonService,
  ],
  exports: [UsersService, UserScoresService, UserLessonService],
})
export class UsersModule {}
