import { QuestionTypeCode } from '@utils/enums';
import { Document } from 'mongoose';
export declare class Question {
    _id: string;
    choices: {
        _id: string;
        active: boolean;
    }[];
    focus: string;
    hiddenIndex: number;
    rank?: number;
    code: QuestionTypeCode;
    wordId?: string;
}
export declare const QuestionSchema: import("mongoose").Schema<Document<Question, any, any>, import("mongoose").Model<Document<Question, any, any>, any, any>, undefined, {}>;
export declare type QuestionDocument = Document & Question;
