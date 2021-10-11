import { Module } from '@nestjs/common';
import { NotificationQueueModule } from './notification';
import { UserQueueModule } from './userQueue';
import { BookQueueModule } from './book';
import { ProgressQueueModule } from './progress';
import { FollowingQueueModule } from './following';
import { StoryQueueModule } from './story';

@Module({
  imports: [
    UserQueueModule,
    NotificationQueueModule,
    BookQueueModule,
    ProgressQueueModule,
    FollowingQueueModule,
    StoryQueueModule,
  ],
})
export class QueueModule {}
