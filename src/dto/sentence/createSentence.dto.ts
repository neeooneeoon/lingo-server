import { ApiProperty } from '@nestjs/swagger';

export class CreateSentenceDto {
  @ApiProperty({ type: String, required: true })
  questionId: string;

  @ApiProperty({ type: String, required: true })
  content: string;

  @ApiProperty({ type: String, required: true })
  meaning: string;

  @ApiProperty({ type: String, required: false, default: '' })
  audio: string;
}
