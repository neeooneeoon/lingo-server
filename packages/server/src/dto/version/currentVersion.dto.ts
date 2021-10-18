import { ApiProperty } from '@nestjs/swagger';

export class CurrentVersionDto {
  @ApiProperty({ type: String, required: false, default: '' })
  description: string;

  @ApiProperty({ type: String, required: true })
  tag: string;

  @ApiProperty({ type: String, required: false, default: 'Android' })
  os: string;
}
