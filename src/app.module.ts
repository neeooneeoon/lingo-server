import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigsModule, ConfigsService } from '@configs';
import { BooksModule } from '@libs/books';
import { UsersModule } from '@libs/users';
import { LeaderBoardsModule } from '@libs/leaderBoards';
import { ReportsModule } from '@libs/reports';
import { FollowingsModule } from '@libs/followings';
import { CaslModule } from '@middlewares/casl/casl.module';
import { AdminModules } from '@admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksSModule } from '@libs/tasks/tasks.module';
import { NotificationsModule } from '@libs/notifications';
import { StoriesModule } from '@libs/stories';
import { CacheModule } from '@cache';

@Module({
  imports: [
    ConfigsModule,
    CacheModule,
    MongooseModule.forRootAsync({
      inject: [ConfigsService],
      useFactory: async (configsService: ConfigsService) =>
        configsService.getMongoConfig(),
    }),
    ScheduleModule.forRoot(),
    TasksSModule,
    BooksModule,
    UsersModule,
    LeaderBoardsModule,
    ReportsModule,
    FollowingsModule,
    CaslModule,
    AdminModules,
    NotificationsModule,
    StoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
