import { ApiProperty } from '@nestjs/swagger';

export class MatchVersionDto {
  @ApiProperty({ type: Boolean, required: true, default: false })
  isMatch: boolean;

  @ApiProperty({ type: String, required: true })
  currentVersion: string;
}
