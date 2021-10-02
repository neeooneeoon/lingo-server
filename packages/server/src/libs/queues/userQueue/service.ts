import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';

@Injectable()
export class UserQueueService {
  constructor(@InjectQueue('user') private userQueue: Queue) {}

  @Cron('10 0 * * *')
  async updateRanking() {
    await this.userQueue.add('updateRanking', {}, { priority: 2 });
  }

  @Cron('25 0 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async pushProfile() {
    await this.userQueue.add('pushProfile', {}, { priority: 1 });
  }

  @Cron('15 0 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async changeStreakScore() {
    await this.userQueue.add('changeStreakScore', {}, { priority: 2 });
  }
}
