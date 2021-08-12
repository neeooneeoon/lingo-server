import { forwardRef, Module } from '@nestjs/common';
import { NotificationsService } from './providers/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceToken, DeviceTokenSchema } from '@entities/deviceToken.entity';
import {
  Notification,
  NotificationSchema,
} from '@entities/notification.entity';
import { FollowingsModule } from '@libs/followings';
import { UsersModule } from '@libs/users';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceToken.name, schema: DeviceTokenSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    FollowingsModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
