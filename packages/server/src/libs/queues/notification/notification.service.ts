import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';

@Injectable()
export class NotificationQueueService {
  constructor(@InjectQueue('notification') private notificationQueue: Queue) {}

  @Cron('30 6 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async remindLearnVocabulary() {
    await this.notificationQueue.add(
      'remindLearnVocabulary',
      {},
      { priority: 1 },
    );
  }

  @Cron('0 19 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async dailyRemind() {
    await this.notificationQueue.add('dailyRemind', {}, { priority: 1 });
  }

  @Cron('45 8 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async scoreReminderMorning() {
    await this.notificationQueue.add(
      'scoreReminderMorning',
      {},
      { priority: 1 },
    );
  }

  @Cron('30 15 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async scoreReminderAfternoon() {
    await this.notificationQueue.add(
      'scoreReminderAfternoon',
      {},
      { priority: 1 },
    );
  }
}
