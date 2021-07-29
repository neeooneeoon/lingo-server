import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { NotificationsService } from '../providers/notifications.service';
import { PoliciesGuard } from '@middlewares/policy/policy.guard';
import { CheckPolicies } from '@middlewares/policy/policy.decorator';
import { UserPermission } from '@middlewares/policy/permissions/user.permission';
import { Action } from '@utils/enums';

@Controller('api/notification')
@ApiTags('Notification')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('enable')
  @CheckPolicies(new UserPermission(Action.Manage))
  pushNotification() {
    return this.notificationsService.scheduleNotifications();
  }
}
