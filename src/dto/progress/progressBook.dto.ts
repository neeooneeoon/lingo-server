import { ApiProperty } from '@nestjs/swagger';
import { ProgressUnit } from './progressUnit.dto';

export class ProgressBook {
  @ApiProperty({ type: Number })
  grade: number;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  bookId: string;

  @ApiProperty({ type: Number })
  totalUnits: number;
  @ApiProperty({ type: Number })
  score: number;

  @ApiProperty({ type: Number })
  level: number;

  @ApiProperty({ type: Number })
  doneQuestions: number;

  @ApiProperty({ type: Number })
  correctQuestions: number;

  @ApiProperty({ type: Number })
  totalLessons: number;

  @ApiProperty({ type: Number })
  doneLessons: number;

  @ApiProperty({ type: Date })
  lastDid: Date;

  @ApiProperty({ type: [ProgressUnit] })
  units: ProgressUnit[];
}
