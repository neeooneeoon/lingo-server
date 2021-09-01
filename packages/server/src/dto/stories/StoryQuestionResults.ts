import { ApiProperty } from '@nestjs/swagger';

export class ResultItem {
  @ApiProperty({ type: String, required: true, description: 'Sentence Id' })
  sentenceId: string;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Question score',
    default: 1,
  })
  score: number;
}

export class StoryResult {
  @ApiProperty({ type: [ResultItem] })
  results: ResultItem[];
}
