import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

class ItemResult {
  @ApiProperty({ type: String })
  _id: string;

  @ApiProperty({ type: String })
  answer: string;
}

export class SaveLessonDto {
  @ApiProperty({ type: String })
  bookId: string;

  @ApiProperty({ type: String })
  unitId: string;

  @ApiProperty({ type: Number })
  @IsInt()
  levelIndex: number;

  @ApiProperty({ type: Number })
  @IsInt()
  lessonIndex: number;

  @ApiProperty({ type: String, format: 'date-time' })
  timeStart: string;

  @ApiProperty({ type: String, format: 'date-time' })
  timeEnd: string;

  @ApiProperty({ type: Number })
  doneQuestions: number;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: { _id: { type: 'string' }, answer: { type: 'string', default: 'string/array/boolean/object' } },
    },
  })
  results: Array<ItemResult>;
}
