import { Document } from 'mongoose';
export declare class Word {
    _id: string;
    bookNId: number;
    unitNId: number;
    content: string;
    meaning: string;
    meanings: string[];
    pronunciations?: string[];
    types?: string[];
    imageRoot: string;
    isUseToMakeQuestion: boolean;
}
export declare const WordSchema: import("mongoose").Schema<Document<Word, any, any>, import("mongoose").Model<Document<Word, any, any>, any, any>, undefined, {}>;
export declare type WordDocument = Document & Word;
