import { Module } from '@nestjs/common';
import { NotificationQueueModule } from './notification';
import { UserQueueModule } from './userQueue';
import { BookQueueModule } from './book';
import { ProgressQueueModule } from './progress';
import { FollowingQueueModule } from './following';

@Module({
  imports: [
    UserQueueModule,
    NotificationQueueModule,
    BookQueueModule,
    ProgressQueueModule,
    FollowingQueueModule,
  ],
})
export class QueueModule {}
