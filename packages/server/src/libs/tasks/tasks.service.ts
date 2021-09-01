import { UsersService } from '@libs/users/providers/users.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from '@libs/notifications/providers/notifications.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private usersService: UsersService,
    private notificationsService: NotificationsService,
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

  @Cron('0 15 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async scoreReminderAfternoon() {
    this.logger.log('Score reminder');
    return this.notificationsService.scoreReminderNotification();
  }

  @Cron('0 9 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async scoreReminderMorning() {
    this.logger.log('Score reminder');
    return this.notificationsService.scoreReminderNotification();
  }
}
