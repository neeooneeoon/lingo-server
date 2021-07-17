import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { NotificationsService } from '../providers/notifications.service';
import { PushNotificationDto } from '@dto/notification';

@ApiTags('Notification')
@UseGuards(JwtAuthGuard)
@Controller('api/notification')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('enable')
  @ApiBody({ type: PushNotificationDto, required: true })
  pushNotification(@Body() body: PushNotificationDto) {
    // return this.notificationsService.sendNotification(body);
  }
}
