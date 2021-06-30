import { ProgressUnitMapping } from "./progressUnitMapping.dto";

export class ProgressBookMapping {
    bookId: string;
    totalUnits: number;
    units: ProgressUnitMapping[];
    level: number;
    score: number;
    totalQuestions: number;
    doneQuestions: number;
}