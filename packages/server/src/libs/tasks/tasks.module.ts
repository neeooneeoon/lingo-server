import { VersionsModule } from '@admin/versions';
import { ProgressesModule } from '@libs/progresses';
import { BooksModule } from '@libs/books';
import { UsersModule } from '@libs/users';
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { NotificationsModule } from '@libs/notifications';
import { StoriesTask } from '@libs/tasks/stories.task';
import { StoriesModule } from '@libs/stories';
import { CacheModule } from '@cache';

@Module({
  imports: [
    UsersModule,
    NotificationsModule,
    BooksModule,
    ProgressesModule,
    VersionsModule,
    StoriesModule,
    CacheModule,
  ],
  providers: [TasksService, StoriesTask],
})
export class TasksSModule {}
