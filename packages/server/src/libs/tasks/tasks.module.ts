import { VersionsModule } from '@admin/versions';
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { StoriesModule } from '@libs/stories';
import { CacheModule } from '@cache';

@Module({
  imports: [VersionsModule, StoriesModule, CacheModule],
  providers: [TasksService],
})
export class TasksSModule {}
