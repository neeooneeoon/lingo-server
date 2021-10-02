import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';

@Injectable()
export class BookQueueService {
  constructor(@InjectQueue('book') private readonly bookQueue: Queue) {}

  @Cron('15 1 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async pushBooksToCache() {
    await this.bookQueue.add('pushBooksToCache', {}, { priority: 1 });
  }

  @Cron('0 2 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async pushStoriesToCache() {
    await this.bookQueue.add('pushStoriesToCache', {}, { priority: 2 });
  }
}
