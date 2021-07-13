import { Module } from '@nestjs/common';
import { NotificationsService } from './providers/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';

@Module({
  imports: [],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
