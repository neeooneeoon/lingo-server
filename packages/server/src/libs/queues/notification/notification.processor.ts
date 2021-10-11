import { NotificationsService } from '@libs/notifications/providers/notifications.service';
import { Process, Processor } from '@nestjs/bull';
import { BadRequestException, Logger } from '@nestjs/common';
import {
  DAILY_MESSAGE,
  LEARNING_VOCABULARY_MESSAGE,
} from '@libs/notifications/constants';
import { DoneCallback, Job } from 'bull';

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationService: NotificationsService) {}

  @Process('dailyRemind')
  async handleDailyRemind() {
    try {
      this.logger.debug('Start dailyRemind');
      await this.notificationService.sendStaticMessage(DAILY_MESSAGE);
      this.logger.debug('Done dailyRemind');
      return;
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException(error);
    }
  }

  @Process('remindLearnVocabulary')
  async handleRemindLearnVocabulary() {
    try {
      this.logger.debug('Start remindLearnVocabulary');
      await this.notificationService.sendStaticMessage(
        LEARNING_VOCABULARY_MESSAGE,
      );
      this.logger.debug('Done remindLearnVocabulary');
      return;
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException(error);
    }
  }

  @Process('scoreReminderMorning')
  async handleScoreReminderMorning(job: Job, doneCallback: DoneCallback) {
    try {
      this.logger.debug('Start scoreReminderMorning');
      await this.notificationService.scoreReminderNotification();
      this.logger.debug('Done scoreReminderMorning');
      doneCallback();
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException(error);
    }
  }

  @Process('scoreReminderAfternoon')
  async handleScoreReminderAfternoon() {
    try {
      this.logger.debug('Start scoreReminderAfternoon');
      await this.notificationService.scoreReminderNotification();
      this.logger.debug('Done scoreReminderAfternoon');
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException(error);
    }
  }
}
