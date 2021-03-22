import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProgressBook = {
    bookId: string,
    totalUnits: number,
    score: number,
    level: number,
    doneQuestions: number,
    correctQuestions: number,
    totalLessons: number,
    doneLessons: number,
    lastDid: Date,
    units: ProgressBookUnit[]
}

export type ProgressBookUnit = {
    unitId: string,
    totalLevels: number,
    passedLevels: number,
    doneLessons: number,
    doneQuestions: number,
    correctQuestions: number,
    lastDid: Date,
    levels: ProgressBookUnitLevel[]
}
export type ProgressBookUnitLevel = {
    levelIndex: number,
    totalLessons: number,
    doneLessons: number,
    passed: boolean,
    lessons: Array<number>
}

@Schema()
export class Progress {

    @Prop({ type: Types.ObjectId, unique: 1 })
    userId: Types.ObjectId;

    @Prop({ type: [Object] })
    books: ProgressBook[]

}

export type ProgressDocument = Document & Progress;
export const ProgressSchema = SchemaFactory.createForClass(Progress);
