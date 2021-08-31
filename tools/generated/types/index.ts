import { QUESTION_ENUM } from 'tools/generated/enums';

export type QuestionInfo = {
  type: number;
  group: QUESTION_ENUM;
  matchingLabels: Array<string>;
  wordLabel?: string | undefined;
  sentenceLabel?: string | undefined;
};
