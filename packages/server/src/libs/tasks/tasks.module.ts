import { BooksModule } from '@libs/books';
import { UsersModule } from '@libs/users';
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { NotificationsModule } from '@libs/notifications';

@Module({
  imports: [UsersModule, NotificationsModule, BooksModule],
  providers: [TasksService],
})
export class TasksSModule {}
