import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';

@Injectable()
export class FollowingQueueService {
  constructor(
    @InjectQueue('following') private readonly followingQueue: Queue,
  ) {}

  @Cron('0 4 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async pushTagsToCache() {
    await this.followingQueue.add('pushTagsToCache', {}, { priority: 1 });
  }
}
