import { Rating } from 'string-similarity';
import { QUESTION_ENUM, PATTERN_KEYS_ENUM, QUESTION_RANK_ENUM } from 'tools/src/generated/enums';
import { Word } from '@entities/word.entity';
import { Sentence } from '@entities/sentence.entity';
export declare type QuestionInfo = {
    type: number;
    group: QUESTION_ENUM;
    matchingLabels: Array<string>;
    wordLabel?: string | undefined;
    sentenceLabel?: string | undefined;
};
export declare type QuestionRanking = {
    [key in PATTERN_KEYS_ENUM]: {
        [key in QUESTION_RANK_ENUM]: {
            [key: string]: number;
        };
    };
};
export declare type SentenceSimilarity = Rating & {
    _id: string;
    bookNId: number;
    unitNId: number;
};
export declare type StorySimilarity = Rating & {
    _id: string;
    content: string;
};
export declare type SimpleStory = {
    _id: string;
    content: string;
    isConversation: boolean;
};
export declare type WordQuestionParam = {
    type: number;
    wordsIUnit: Array<Word>;
    focusId: string;
    matchingLabels: Array<string>;
};
export declare type GenParamsInput = {
    pattern: QuestionInfo;
    wordsIUnit: Array<Word>;
    labels: Array<string>;
    level: number;
    matchingCounter: {
        level: number;
        n: number;
    };
};
export declare type SentenceQuestionParam = {
    type: number;
    sentencesInUnit: Array<Sentence>;
    focusSentence: Sentence;
    allSentences: Array<Sentence>;
};
export declare type GenerateQuestionInput = {
    words: Word[];
    sentences: Sentence[];
    allSentences: Sentence[];
    levelPatterns: string[];
    labels: string[];
    level: number;
};
