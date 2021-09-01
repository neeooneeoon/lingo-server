import { UsersModule } from '@libs/users';
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { NotificationsModule } from '@libs/notifications';

@Module({
  imports: [UsersModule, NotificationsModule],
  providers: [TasksService],
})
export class TasksSModule {}
