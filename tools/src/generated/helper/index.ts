import { QUESTION_ENUM } from '../enums';
import { QuestionTypeCode } from 'src/utils/enums';

export function getQuestionTypeCode(questionEnum: QUESTION_ENUM, type: number) {
  if (questionEnum === QUESTION_ENUM.WORD) {
    switch (type) {
      case 3:
        return QuestionTypeCode.W3;
      case 6:
        return QuestionTypeCode.W6;
      case 11:
        return QuestionTypeCode.W11;
      case 7:
        return QuestionTypeCode.W7;
      case 2:
        return QuestionTypeCode.W2;
      case 4:
        return QuestionTypeCode.W4;
      case 12:
        return QuestionTypeCode.W12;
      case 9:
        return QuestionTypeCode.W9;
      case 8:
        return QuestionTypeCode.W8;
      case 13:
        return QuestionTypeCode.W13;
      case 14:
        return QuestionTypeCode.W14;
      default:
        break;
    }
  } else if (questionEnum === QUESTION_ENUM.SENTENCE) {
    switch (type) {
      case 12:
        return QuestionTypeCode.S12;
      case 10:
        return QuestionTypeCode.S10;
      case 1:
        return QuestionTypeCode.S1;
      case 2:
        return QuestionTypeCode.S2;
      case 14:
        return QuestionTypeCode.S14;
      case 17:
        return QuestionTypeCode.S17;
      case 7:
        return QuestionTypeCode.S7;
      case 15:
        return QuestionTypeCode.S15;
      case 16:
        return QuestionTypeCode.S16;
      case 4:
        return QuestionTypeCode.S4;
      case 18:
        return QuestionTypeCode.S18;
      default:
        break;
    }
  }
}
