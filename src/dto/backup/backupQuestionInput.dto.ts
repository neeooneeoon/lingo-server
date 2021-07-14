import { QuestionTypeCode } from '@utils/enums';

export class BackupQuestionInputDto {
  [path: string]: {
    choiceId: string;
    code: QuestionTypeCode;
    focusId: string;
  }[];
}

// export class Dynamic {
//   [path: string]: {
//     choiceId: string;
//     code: QuestionTypeCode;
//     focusId: string;
//   }[];
// }
