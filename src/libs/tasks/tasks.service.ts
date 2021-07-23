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

  @Cron('0 5 * * *')
  async changeStreakScore() {
    console.log('Start streak');
    this.logger.log('Starting check streak');
    const users = await this.usersService.getAllUsers();
    await Promise.all(
      users.map((user) => this.usersService.changeUserStreak(String(user._id))),
    );
  }
  s;
  @Cron('0 0 * * *')
  sendNotification() {
    this.logger.log('Starting send notification');
    return this.notificationsService.scheduleNotifications();
  }
}
