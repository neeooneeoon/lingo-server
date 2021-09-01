import { Collection } from 'mongodb';
import { Word } from '@entities/word.entity';
import { Question } from '@entities/question.entity';
import { WordQuestionParam, GenParamsInput } from 'tools/src/generated/types';
export declare class WordsService {
    private readonly wordsCollection;
    constructor(_wordsCollection: Collection<Word>);
    wordsInUnit(bookNId: number, unitNId: number): Promise<Word[]>;
    static getParamsFromPattern(input: GenParamsInput): Array<WordQuestionParam>;
    static generateQuestion(param: WordQuestionParam & {
        questionId: string;
    }): Question;
}
