import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { NotificationsService } from '../providers/notifications.service';

@ApiTags('Notification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('api/notification')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('enable')
  pushNotification() {
    return this.notificationsService.scheduleNotifications();
  }
}
