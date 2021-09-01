import { ApiProperty } from '@nestjs/swagger';

export class AppleLoginDto {
  @ApiProperty({ type: String, required: true, name: 'code' })
  code: string;
}
