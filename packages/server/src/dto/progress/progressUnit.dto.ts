import { ProgressLevel } from './progressLevel.dto';
import { ApiProperty } from '@nestjs/swagger';
export class ProgressUnit {
  @ApiProperty({ type: String })
  unitId: string;

  @ApiProperty({ type: Number })
  totalLevels: number;

  @ApiProperty({ type: Number })
  passedLevels: number;

  @ApiProperty({ type: Number })
  doneLessons: number;

  @ApiProperty({ type: Number })
  doneQuestions: number;

  @ApiProperty({ type: Number })
  correctQuestions: number;

  @ApiProperty({ type: Date })
  lastDid: Date;

  @ApiProperty({ type: [ProgressLevel] })
  levels: ProgressLevel[];

  @ApiProperty({ type: String })
  normalImage: string;

  @ApiProperty({ type: String })
  blueImage: string;

  @ApiProperty({ type: Number })
  totalLessons: number;

  @ApiProperty({ type: String })
  unitName: string;
}
