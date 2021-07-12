import { Module } from '@nestjs/common';
import { NotificationsService } from './providers/notifications.service';

@Module({
  imports: [],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
