import { ApiProperty } from '@nestjs/swagger';

class ItemResult {
  @ApiProperty({ type: String })
  _id: string;

  @ApiProperty({ type: String })
  answer: string;
}

export class StoryQuestionResults {
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
        sentenceId: { type: 'string' },
        answer: { type: 'string', default: 'string/array/boolean/object' },
      },
    },
  })
  results: Array<ItemResult>;
}
