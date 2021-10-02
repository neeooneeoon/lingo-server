import { ConfigsService } from '@configs';
import { FollowingsModule } from '@libs/followings';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { FollowingProcessor } from './following.processor';
import { FollowingQueueService } from './following.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'following',
      inject: [ConfigsService],
      useFactory: async (configsService: ConfigsService) => ({
        redis: {
          host: configsService.get('REDIS_HOST'),
          port: Number(configsService.get('REDIS_PORT')),
        },
      }),
    }),
    FollowingsModule,
  ],
  providers: [FollowingQueueService, FollowingProcessor],
})
export class FollowingQueueModule {}
