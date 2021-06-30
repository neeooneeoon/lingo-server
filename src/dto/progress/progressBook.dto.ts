import { ProgressUnit } from './progressUnit.dto';

export class ProgressBook {
    bookId: string;
    totalUnits: number;
    score: number;
    level: number;
    doneQuestions: number;
    correctQuestions: number;
    totalLessons: number;
    doneLessons: number;
    lastDid: Date;
    units: ProgressUnit[];
}