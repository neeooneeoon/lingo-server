import { Rating } from 'string-similarity';
import {
  QUESTION_ENUM,
  PATTERN_KEYS_ENUM,
  QUESTION_RANK_ENUM,
} from 'tools/src/generated/enums';

export type QuestionInfo = {
  type: number;
  group: QUESTION_ENUM;
  matchingLabels: Array<string>;
  wordLabel?: string | undefined;
  sentenceLabel?: string | undefined;
};

export type QuestionRanking = {
  [key in PATTERN_KEYS_ENUM]: {
    [key in QUESTION_RANK_ENUM]: {
      [key: string]: number;
    };
  };
};

export type SentenceSimilarity = Rating & {
  _id: string;
  bookNId: number;
  unitNId: number;
};
export type StorySimilarity = Rating & {
  _id: string;
  content: string;
};

export type SimpleStory = {
  _id: string;
  content: string;
  isConversation: boolean;
};
