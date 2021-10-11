import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';

@Injectable()
export class StoryQueueService {
  constructor(@InjectQueue('story') private storyQueue: Queue) {}

  @Cron('30 23 * * *')
  async pushStories() {
    await this.storyQueue.add('pushStories', {}, { priority: 1 });
  }
}
