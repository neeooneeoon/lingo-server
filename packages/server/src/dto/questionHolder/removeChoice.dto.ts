import { ApiProperty } from '@nestjs/swagger';
import { QuestionTypeCode } from '@utils/enums';

export class RemoveChoiceDto {
  @ApiProperty({ type: String, required: true })
  questionId: string;

  @ApiProperty({ type: String, required: true })
  choiceId: string;
}
export class AddChoiceDto {
  @ApiProperty({ type: String, required: true })
  questionId: string;

  @ApiProperty({ type: String, required: true })
  focusId: string;

  @ApiProperty({ type: String, required: true, enum: QuestionTypeCode })
  code: QuestionTypeCode;

  @ApiProperty({ type: String, required: true })
  choiceId: string;

  @ApiProperty({ type: String, required: false })
  content?: string;

  @ApiProperty({ type: String, required: false })
  meaning?: string;
}
