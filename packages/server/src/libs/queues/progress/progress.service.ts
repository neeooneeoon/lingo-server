import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';

@Injectable()
export class ProgressQueueService {
  constructor(@InjectQueue('progress') private readonly progressQueue: Queue) {}

  @Cron('20 1 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async pushProgressBooksToCache() {
    await this.progressQueue.add(
      'pushProgressBooksToCache',
      {},
      { priority: 1 },
    );
  }
}
