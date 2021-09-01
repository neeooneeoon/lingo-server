import { QuestionInfo } from 'tools/src/generated/types';
export declare class PatternsService {
    private readonly grade;
    private readonly unitPattern;
    private readonly originalPattern;
    constructor(_grade: number);
    getLabels(totalWords: number): Array<string>;
    getLevelsLabels(): Array<Array<string>>;
    static isInLabels(questionInfo: QuestionInfo, listLabels: Array<string>): boolean;
}
