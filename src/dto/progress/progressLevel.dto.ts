import { ApiProperty } from '@nestjs/swagger';

export class ProgressLevel {
  @ApiProperty({ type: Number })
  levelIndex: number;

  @ApiProperty({ type: Number })
  totalLessons: number;

  @ApiProperty({ type: Number })
  doneLessons: number;

  @ApiProperty({ type: Boolean })
  passed: boolean;

  @ApiProperty({ type: [Number] })
  lessons: Array<number>;
}
