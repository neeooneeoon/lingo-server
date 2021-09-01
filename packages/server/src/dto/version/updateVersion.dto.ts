import { ApiProperty } from '@nestjs/swagger';

export class UpdateVersionDto {
  @ApiProperty({ type: String, required: true })
  tag: string;

  @ApiProperty({ type: String, required: false, default: '' })
  description: string;
}
