import { ApiProperty } from '@nestjs/swagger';
import { Notification as NotificationEnum } from '@utils/enums';

export class CreateNotificationTemplateDto {
  @ApiProperty({ type: String, required: false, default: '' })
  tag?: string;

  @ApiProperty({ type: String, required: false, default: '' })
  body?: string;

  @ApiProperty({ type: String, required: false, default: '' })
  icon?: string;

  @ApiProperty({ type: String, required: false, default: '' })
  badge?: string;

  @ApiProperty({ type: String, required: false, default: '' })
  color?: string;

  @ApiProperty({ type: String, required: false, default: '' })
  sound?: string;

  @ApiProperty({ type: String, required: false, default: '' })
  title?: string;

  @ApiProperty({ type: String, required: false, default: '' })
  bodyLocKey?: string;

  @ApiProperty({ type: String, required: false, default: '' })
  bodyLocArgs?: string;

  @ApiProperty({ type: String, required: false, default: '' })
  clickAction?: string;

  @ApiProperty({ type: String, required: false, default: '' })
  titleLocKey?: string;

  @ApiProperty({ type: String, required: false, default: '' })
  titleLocArgs?: string;

  @ApiProperty({
    type: String,
    required: true,
    enum: NotificationEnum,
  })
  hashCode: NotificationEnum;
}
