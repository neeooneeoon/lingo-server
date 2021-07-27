import { ApiProperty } from '@nestjs/swagger';

export class LoginBodyDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'Access token',
  })
  access_token?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Access token',
  })
  appleId?: string;

  @ApiProperty({ type: String, required: false })
  email?: string;

  @ApiProperty({ type: String, required: false })
  displayName?: string;

  @ApiProperty({ type: String, required: false, default: '' })
  avatar?: string;

  @ApiProperty({ type: String, required: true })
  deviceToken: string;
}
