import { ApiProperty } from '@nestjs/swagger';
import { QuestionTypeCode } from '@utils/enums';

export class CreateSentenceDto {
  @ApiProperty({ type: String, required: true })
  questionId: string;

  @ApiProperty({ type: String, required: true })
  focusId: string;

  @ApiProperty({ type: String, required: true, enum: QuestionTypeCode })
  code: QuestionTypeCode;

  @ApiProperty({ type: String, required: true })
  content: string;

  @ApiProperty({ type: String, required: true })
  meaning: string;

  @ApiProperty({ type: String, required: false, default: '' })
  audio?: string;
}
