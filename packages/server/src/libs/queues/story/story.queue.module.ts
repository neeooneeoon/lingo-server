import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigsService } from '@configs';
import { StoriesModule } from '@libs/stories';
import { StoryQueueService } from './story.queue.service';
import { StoryQueueProcessor } from './story.queue.processor';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'story',
      inject: [ConfigsService],
      useFactory: async (configsService: ConfigsService) => ({
        redis: {
          host: configsService.get('REDIS_HOST'),
          port: Number(configsService.get('REDIS_PORT')),
        },
      }),
    }),
    StoriesModule,
  ],
  providers: [StoryQueueService, StoryQueueProcessor],
})
export class StoryQueueModule {}
