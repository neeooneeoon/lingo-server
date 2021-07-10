import { ApiProperty } from '@nestjs/swagger';

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
  content: string;
}
