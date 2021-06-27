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

@Module({
  imports: [
    ConfigsModule,
    MongooseModule.forRootAsync({
      inject: [ConfigsService],
      useFactory: async (configsService: ConfigsService) => configsService.getMongoConfig(),
    }),
    BooksModule,
    UsersModule,
    LeaderBoardsModule,
    ReportsModule,
    FollowingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
