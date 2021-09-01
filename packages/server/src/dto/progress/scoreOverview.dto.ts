import { ApiProperty } from '@nestjs/swagger';

export class ScoreOverviewDto {
  @ApiProperty({ type: Number, required: true, default: 0 })
  streak: number;

  @ApiProperty({ type: Number, required: true, default: 0 })
  xp: number;

  @ApiProperty({ type: Number, required: false, default: 0 })
  doneLessons: number;

  @ApiProperty({ type: Number, required: false, default: 0 })
  correctQuestions: number;
}
