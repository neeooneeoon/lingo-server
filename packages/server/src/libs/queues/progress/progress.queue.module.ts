import { ProgressesModule } from '@libs/progresses';
import { ConfigsService } from '@configs';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ProgressQueueService } from './progress.service';
import { ProgressProcessor } from './progress.processor';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'progress',
      inject: [ConfigsService],
      useFactory: async (configsService: ConfigsService) => ({
        redis: {
          host: configsService.get('REDIS_HOST'),
          port: Number(configsService.get('REDIS_PORT')),
        },
      }),
    }),
    ProgressesModule,
  ],
  providers: [ProgressQueueService, ProgressProcessor],
})
export class ProgressQueueModule {}
