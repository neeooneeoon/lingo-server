import { ApiProperty } from '@nestjs/swagger';
import { QuestionTypeCode } from '@utils/enums';

export class ItemResult {
  @ApiProperty({ type: String })
  _id: string;

  @ApiProperty({ type: String })
  answer: string;

  @ApiProperty({ type: String, enum: QuestionTypeCode })
  code: QuestionTypeCode;

  @ApiProperty({ type: String })
  focus: string;
}

export class SaveLessonDto {
  @ApiProperty({ type: String })
  bookId: string;

  @ApiProperty({ type: String })
  unitId: string;

  @ApiProperty({ type: Number })
  levelIndex: number;

  @ApiProperty({ type: Number })
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
      properties: {
        _id: { type: 'string' },
        answer: { type: 'string', default: 'string/array/boolean/object' },
        code: { type: 'string', enum: Object.values(QuestionTypeCode) },
        focus: { type: 'string' },
      },
    },
  })
  results: Array<ItemResult>;
}
