import { Sentence } from '@entities/sentence.entity';
import { Collection } from 'mongodb';
export declare class PunctuationService {
    private readonly punctuationSet;
    private readonly focusSentence;
    private readonly sentencesCollection;
    constructor(__punctuations: Array<string>, _focusSentence: Sentence, _sentencesCollection: Collection<Sentence>);
    private containPunctuations;
    private static compareBaseSimilarityRate;
    private findBestMatchSentences;
    private findBestMatchStories;
    similaritySentences(listSentences: Sentence[]): string[];
    similarityStories(): Promise<string[]>;
}
