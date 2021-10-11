import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';
import cluster from 'cluster';

@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);
  constructor(@InjectQueue('notification') private notificationQueue: Queue) {
    // this.notific;
  }

  @Cron('30 6 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async remindLearnVocabulary() {
    await this.notificationQueue.add(
      'remindLearnVocabulary',
      {},
      { priority: 1 },
    );
  }

  @Cron('22 11 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  dailyRemind() {
    // cluster.setupMaster();
    setTimeout
    const NAME_JOB = 'dailyRemind';
    this.notificationQueue
      .getJobs(['waiting', 'active', 'delayed'])
      .then((waitingJobs) => {
        const listNameJobs: Array<string> = [];
        if (waitingJobs?.length > 0) {
          waitingJobs.forEach((element) => {
            listNameJobs.push(element?.name);
          });
        }
        if (!listNameJobs?.includes(NAME_JOB)) {
          this.notificationQueue
            .add(
              NAME_JOB,
              {},
              { priority: 1, removeOnComplete: true, removeOnFail: true },
            )
            .then((r) => {
              this.notificationQueue.close().then(() => {
                console.log('Closed');
              });
            });
        }
      });
    // if (cluster.isMaster) {
    //   await this.notificationQueue.add('dailyRemind', {}, { priority: 1 });
    // } else {
    //   const waitingJobs = await this.notificationQueue.getJobs(['waiting']);
    //   const listNameJobs: Array<string> = [];
    //   if (waitingJobs?.length > 0) {
    //     waitingJobs.forEach((element) => {
    //       listNameJobs.push(element?.name);
    //     });
    //   }
    //   if (!listNameJobs?.includes(NAME_JOB)) {
    //     await this.notificationQueue.add('dailyRemind', {}, { priority: 1 });
    //     this.logger.debug('pushed');
    //   }
    // }
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
