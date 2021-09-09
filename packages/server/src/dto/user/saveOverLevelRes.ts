import { ApiProperty } from '@nestjs/swagger';

export class SaveOverLevelRes {
  @ApiProperty({ type: String })
  message: string;

  @ApiProperty({ type: Boolean })
  success: boolean;

  @ApiProperty({ type: Boolean })
  passed: boolean;
}
