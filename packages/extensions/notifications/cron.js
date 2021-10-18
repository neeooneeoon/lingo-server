'use strict';

import { CronJob } from 'cron';
import { notificationQueue } from './queue.js';
import { TIME_ZONE } from '../configs/index.js';

const vocabularyRemind = new CronJob(
  '50 6 * * *',
  async () => {
    await notificationQueue.add('remindLearnVocabulary', {}, { priority: 1 });
  },
  null,
  false,
  TIME_ZONE,
);
vocabularyRemind.start();

const dailyRemind = new CronJob(
  '30 19 * * *',
  async () => {
    await notificationQueue.add('dailyRemind', {}, { priority: 1 });
  },
  null,
  false,
  TIME_ZONE,
);
dailyRemind.start();

const scoreRemindMorning = new CronJob(
  '45 8 * * *',
  async () => {
    await notificationQueue.add('scoreReminderMorning', {}, { priority: 1 });
  },
  null,
  false,
  TIME_ZONE,
);
scoreRemindMorning.start();

const scoreRemindAfternoon = new CronJob(
  '30 15 * * *',
  async () => {
    await notificationQueue.add('scoreReminderMorning', {}, { priority: 1 });
  },
  null,
  false,
  TIME_ZONE,
);
scoreRemindAfternoon.start();

export {
  scoreRemindAfternoon,
  scoreRemindMorning,
  dailyRemind,
  vocabularyRemind,
};
