import { BooksService } from '@libs/books/providers/books.service';
import { UsersService } from '@libs/users/providers/users.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from '@libs/notifications/providers/notifications.service';
import { ProgressesService } from '@libs/progresses/progresses.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private booksService: BooksService,
    private progressesService: ProgressesService,
  ) {}

  @Cron('0 0 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async changeStreakScore() {
    this.logger.log('Starting check streak');
    const users = await this.usersService.getAllUsers();
    await Promise.all(
      users.map((user) => this.usersService.changeUserStreak(String(user._id))),
    );
  }
  @Cron('0 19 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async sendNotification() {
    this.logger.log('Starting send notification');
    return this.notificationsService.scheduleNotifications();
  }

  @Cron('30 6 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async remindLearnVocabulary() {
    return this.notificationsService.remindLearnVocabulary();
  }

  @Cron('30 15 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async scoreReminderAfternoon() {
    this.logger.log('Score reminder');
    return this.notificationsService.scoreReminderNotification();
  }

  @Cron('45 8 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async scoreReminderMorning() {
    this.logger.log('Score reminder');
    return this.notificationsService.scoreReminderNotification();
  }

  @Cron('30 1 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async pushProfileToCache() {
    this.logger.log('Push profile to cache');
    await this.usersService.pushToCache();
    return;
  }

  @Cron('15 1 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async pushBooksToCache() {
    this.logger.log('Push books to cache');
    await this.booksService.pushToCache();
    return;
  }

  @Cron('20 1 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async pushProgressBooksToCache() {
    this.logger.log('Push progress books to cache');
    await this.progressesService.pushToCache();
    return;
  }
}
