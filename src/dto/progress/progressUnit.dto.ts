import { ProgressLevel } from './progressLevel.dto';

export class ProgressUnit {
    unitId: string;
    totalLevels: number;
    passedLevels: number;
    doneLessons: number;
    doneQuestions: number;
    correctQuestions: number;
    lastDid: Date;
    levels: ProgressLevel[]
}