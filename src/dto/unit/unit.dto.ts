import { UnitLevel } from "./unitLevel.dto";

export class Unit{
    _id: string;
    nId: number;
    unitIndex: number;
    key: string;
    name: string;
    description: string;
    grammar: string;
    tips: string;
    wordIds: string[];
    sentenceIds: string[];
    levels: UnitLevel[];
    totalLevels: number;
    totalLessons: number;
    totalQuestions: number;
    normalImage: string;
    blueImage: string;
}