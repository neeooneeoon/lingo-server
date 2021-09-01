import { Document } from 'mongoose';
export declare class Sentence {
    _id: string;
    baseId: string;
    bookNId: number;
    unitNId: number;
    audio?: string;
    content: string;
    phrase?: string;
    translate: string;
    translates: string[];
    isConversation: boolean;
    wordBaseIndex: number;
    translateSplit: [
        {
            _id: string;
            wordId: string;
            text: string;
            isFocus: boolean;
        }
    ];
    contentSplit: [
        {
            _id: string;
            wordId: string;
            text: string;
            types: string[];
        }
    ];
    questionSection: string;
    contextSection: string;
    lowerBound: number;
    upperBound: number;
}
export declare const SentenceSchema: import("mongoose").Schema<Document<Sentence, any, any>, import("mongoose").Model<Document<Sentence, any, any>, any, any>, undefined, {}>;
export declare type SentenceDocument = Document & Sentence;
