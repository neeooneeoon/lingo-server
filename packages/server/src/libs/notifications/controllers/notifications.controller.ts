import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { NotificationsService } from '../providers/notifications.service';
import { PoliciesGuard } from '@middlewares/policy/policy.guard';
import { CheckPolicies } from '@middlewares/policy/policy.decorator';
import { UserPermission } from '@middlewares/policy/permissions/user.permission';
import { Action } from '@utils/enums';
import { CreateNotificationTemplateDto } from '@dto/notification/createNotificationTemplate.dto';

@Controller('api/notification')
@ApiTags('Notification')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('enable/:notificationId')
  @CheckPolicies(new UserPermission(Action.Manage))
  @ApiParam({ type: String, required: true, name: 'notificationId' })
  @ApiOperation({ summary: 'Push thông báo' })
  pushNotification(@Param('notificationId') notificationId: string) {
    return this.notificationsService.updateSystem();
  }

  @Get('listNotifications')
  @CheckPolicies(new UserPermission(Action.Manage))
  getListNotifications() {
    return this.notificationsService.getListNotifications();
  }

  @Post('create')
  @CheckPolicies(new UserPermission(Action.Manage))
  @ApiBody({ type: CreateNotificationTemplateDto, required: true })
  @ApiOperation({ summary: 'Tạo một mẫu thông báo mới' })
  createNewNotification(@Body() body: CreateNotificationTemplateDto) {
    return this.notificationsService.createNewNotification(body);
  }

  @Put('edit/:notificationId')
  @ApiParam({ type: String, name: 'notificationId', required: true })
  @ApiBody({ type: CreateNotificationTemplateDto, required: true })
  @ApiOperation({ summary: 'Sửa mẫu thông báo' })
  updateNotificationTemplate(
    @Param('notificationId') notificationId: string,
    @Body() body: CreateNotificationTemplateDto,
  ) {
    return this.notificationsService.updateNotificationTemplate(
      notificationId,
      body,
    );
  }

  @Delete('remove/:notificationId')
  @CheckPolicies(new UserPermission(Action.Manage))
  @ApiParam({ type: String, required: true, name: 'notificationId' })
  @ApiOperation({ summary: 'Xóa mẫu thông báo' })
  deleteNotification(@Param('notificationId') notificationId: string) {
    return this.notificationsService.deleteNotification(notificationId);
  }
}
