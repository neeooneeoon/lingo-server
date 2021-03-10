import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class Lesson {
    lessonIndex: number;
    totalQuestions: number
    questions: [];
    questionIds: [String];
}

export class Level {
    levelIndex: number;
    totalLessons: number;
    totalQuestions: number;
    lessons: [Lesson];
}


@Schema({ timestamps: true })
export class Unit {

    @Prop({ type: String })
    _id: string;

    @Prop({ type: Number })
    nId: number;

    @Prop({ type: Number })
    unitIndex: number;

    @Prop({ type: String })
    key: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String, default: "" })
    description: string;

    @Prop({ type: Number })
    totalLevels: number;

    @Prop({ type: Number })
    totalLessons: number;

    @Prop({ type: Number })
    totalQuestions: number;

    @Prop({ type: String })
    grammar: string;

    @Prop({ type: String })
    tips: string;

    @Prop({ type: [{ type: String, ref: "Word"}] })
    wordIds: string[];

    @Prop({ type: String, ref: "Sentence" })
    sentenceIds: string[];

    @Prop({ type: [Object] })
    levels: Level[];

}

export type UnitDocument = Document & Unit;
export const UnitSchema = SchemaFactory.createForClass(Unit);