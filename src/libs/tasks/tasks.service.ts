import { UsersService } from '@libs/users/providers/users.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { map } from 'rxjs/operators';
import { NotificationsService } from '@libs/notifications/providers/notifications.service';

@Injectable()
export class TasksService {
  constructor(
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  changeStreakScore() {
    const users$ = this.usersService.getAllUsers();
    users$.pipe(
      map((users) => {
        return users.map((user) => {
          return this.usersService.changeUserStreak(String(user._id));
        });
      }),
    );
  }
  @Cron(CronExpression.EVERY_DAY_AT_7PM)
  sendNotification() {
    return this.notificationsService.scheduleNotifications();
  }
}
