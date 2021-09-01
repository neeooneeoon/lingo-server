import { Collection } from 'mongodb';
import { Sentence } from '@entities/sentence.entity';
import { GenParamsInput, SentenceQuestionParam } from 'tools/src/generated/types';
import { Question } from '@entities/question.entity';
export declare class SentencesService {
    private readonly sentencesCollection;
    constructor(_sentencesCollection: Collection<Sentence>);
    sentencesInUnit(bookNId: number, unitNId: number): Promise<Sentence[]>;
    sentencesInBook(bookNId: number): Promise<Sentence[]>;
    findAll(): Promise<Sentence[]>;
    static generateQuestion({ type, focusSentence, sentencesInUnit, allSentences, questionId, sentencesCollection, }: SentenceQuestionParam & {
        questionId: string;
        sentencesCollection: Collection<Sentence>;
    }): Promise<Question>;
    static getParamsFromPattern(input: GenParamsInput): {
        type: number;
        wordId: string;
        sentenceId: string;
    }[];
}
