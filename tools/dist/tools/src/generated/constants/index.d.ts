import { QuestionRanking } from 'tools/src/generated/types';
export declare class GenerationConstants {
    static DIGIT_REGEX: RegExp;
    static ALPHABET_REGEX: RegExp;
    static GRADE_PATTERNS: {
        '1_2': string[];
        '3_5': string[];
        '6_12': string[];
    };
    static QUESTION_RANKS: QuestionRanking;
}
