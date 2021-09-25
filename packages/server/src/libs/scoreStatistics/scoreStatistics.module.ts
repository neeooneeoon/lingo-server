import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '@libs/users';
import {
  ScoreStatistic,
  ScoreStatisticSchema,
} from '@entities/scoreStatistic.entity';
import { ScoreStatisticsService } from './scoreStatistics.service';
import { ScoreStatisticsHelper } from '@helpers/scoreStatistics.helper';
import { FollowingsModule } from '@libs/followings';
import { CacheModule } from '@cache';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScoreStatistic.name, schema: ScoreStatisticSchema },
    ]),
    CacheModule,
    forwardRef(() => UsersModule),
    FollowingsModule,
  ],
  providers: [ScoreStatisticsService, ScoreStatisticsHelper],
  exports: [ScoreStatisticsService],
})
export class ScoreStatisticsModule {}
