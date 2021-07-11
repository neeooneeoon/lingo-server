import { QuestionTypeCode } from '@utils/enums';

export class BackupDto {
  bookId: string;
  unitId: string;
  levelIndex: number;
  focusId: string;
  choiceId: string;
  content: string;
  meaning: string;
  audio?: string;
  code: QuestionTypeCode;
  newInstance: boolean;
}
