import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceTokenDto {
  @ApiProperty({ type: String, required: true, description: 'Device token' })
  token: string;
}
