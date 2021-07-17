import { ApiProperty } from '@nestjs/swagger';

export class ToggleNotificationDto {
  @ApiProperty({
    type: Boolean,
    required: true,
    description: 'Enable Notification',
  })
  enable: boolean;
}

export class ToggleNotificationRes {
  @ApiProperty({
    type: Boolean,
    required: true,
    description: 'Enable Notification',
  })
  enable: boolean;
}
