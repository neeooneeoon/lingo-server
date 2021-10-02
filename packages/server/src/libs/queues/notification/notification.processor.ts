import { NotificationsService } from '@libs/notifications/providers/notifications.service';
import { Process, Processor } from '@nestjs/bull';
import { BadRequestException, Logger } from '@nestjs/common';

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly notificationService: NotificationsService) {}

  @Process('dailyRemind')
  async handleDailyRemind() {
    try {
      this.logger.debug('Start dailyRemind');
      await this.notificationService.dailyRemind();
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
      await this.notificationService.remindLearnVocabulary();
      this.logger.debug('Done remindLearnVocabulary');
      return;
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException(error);
    }
  }

  @Process('scoreReminderMorning')
  async handleScoreReminderMorning() {
    try {
      this.logger.debug('Start scoreReminderMorning');
      await this.notificationService.scoreReminderNotification();
      this.logger.debug('Done scoreReminderMorning');
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
