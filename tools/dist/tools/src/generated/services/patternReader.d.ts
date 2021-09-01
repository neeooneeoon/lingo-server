import { QuestionInfo } from 'tools/src/generated/types';
export declare class PatternReader {
    private pattern;
    constructor(_pattern: string);
    set(_pattern: string): void;
    extract(): QuestionInfo | undefined;
}
