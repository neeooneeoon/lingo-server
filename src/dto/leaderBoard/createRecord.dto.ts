import { ApiProperty } from '@nestjs/swagger';
export class CreateRecordDto {
  @ApiProperty({ type: String, required: true })
  user: string;

  @ApiProperty({ type: Number, required: true })
  xp: number;

  @ApiProperty({ type: String, required: true })
  createdAt: string;

  @ApiProperty({ type: String, required: true })
  updatedAt: string;
}
