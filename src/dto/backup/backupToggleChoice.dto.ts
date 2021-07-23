import { QuestionTypeCode } from '@utils/enums';

export class BackupToggleChoiceDto {
  bookId: string;
  unitId: string;
  levelIndex: number;
  focusId: string;
  choiceId: string;
  code: QuestionTypeCode;
  currentState: boolean;
}
