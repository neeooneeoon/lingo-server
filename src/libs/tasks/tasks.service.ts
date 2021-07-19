import { UsersService } from '@libs/users/providers/users.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '@libs/notifications/providers/notifications.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async changeStreakScore() {
    this.logger.log('Starting check streak');
    const users = await this.usersService.getAllUsers();
    await Promise.all(
      users.map((user) => this.usersService.changeUserStreak(String(user._id))),
    );
  }
  @Cron(CronExpression.EVERY_DAY_AT_7PM)
  sendNotification() {
    this.logger.log('Starting send notification');
    return this.notificationsService.scheduleNotifications();
  }
}
