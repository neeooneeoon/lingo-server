import { ApiProperty } from '@nestjs/swagger';

export class PushNotificationDto {
  @ApiProperty({ type: String, required: true })
  token: string;

  @ApiProperty({ type: String, required: true })
  title: string;

  @ApiProperty({ type: String, required: true })
  body: string;
}
