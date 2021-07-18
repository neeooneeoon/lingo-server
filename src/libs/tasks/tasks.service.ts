import { UsersService } from '@libs/users/providers/users.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { switchMap } from 'rxjs/operators';
import { NotificationsService } from '@libs/notifications/providers/notifications.service';
import { forkJoin } from 'rxjs';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  changeStreakScore() {
    this.logger.log('Starting check streak');
    const users$ = this.usersService.getAllUsers();
    users$.pipe(
      switchMap((users) => {
        return forkJoin([
          ...users.map((user) => {
            return this.usersService.changeUserStreak(String(user._id));
          }),
        ]);
      }),
    );
  }
  @Cron(CronExpression.EVERY_DAY_AT_7PM)
  sendNotification() {
    this.logger.log('Starting send notification');
    return this.notificationsService.scheduleNotifications();
  }
}
