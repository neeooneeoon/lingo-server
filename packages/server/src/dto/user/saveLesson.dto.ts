import { ApiProperty } from '@nestjs/swagger';
import { QuestionTypeCode } from '@utils/enums';

export class ItemResult {
  @ApiProperty({ type: String })
  _id: string;

  @ApiProperty({ type: String })
  answer: string;

  @ApiProperty({ type: String, enum: QuestionTypeCode, required: false })
  code?: QuestionTypeCode;

  @ApiProperty({ type: String, required: false })
  focus?: string;
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

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Tổng số câu hỏi đã làm trong bài học',
  })
  doneQuestions: number;

  @ApiProperty({
    type: Number,
    required: false,
    default: 0,
    description: 'Tổng số câu hỏi trong bài học',
  })
  totalQuestions?: number;

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
