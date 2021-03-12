import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class SentenceQuestion {
    _id: string;
    type: string;
    skills: string[];
    questionType: number;
    interaction: string;
    point: number;
    focusSentence: string;
    sentences: string[]
    wrongWords: string[];
    hiddenWord: number;
    checkSentence: string;
    unitId: string;
    bookId: string;
    content: string;
}

export class WordQuestion {
    _id: string;
    type: string;
    skills: string[];
    interaction: string;
    focusWord: string;
    point: number;
    questionType: number;
    words: string[];
    unitId: string;
    bookId: string;
    content: string;
}
export class Lesson {
    lessonIndex: number;
    totalQuestions: number
    questions: (SentenceQuestion | WordQuestion)[];
    questionIds: Array<string>;
}

export class Level {
    levelIndex: number;
    totalLessons: number;
    totalQuestions: number;
    lessons: Array<Lesson>;
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

    @Prop({ type: [{ type: String, ref: "Word" }] })
    wordIds: string[];

    @Prop({ type: String, ref: "Sentence" })
    sentenceIds: string[];

    @Prop({ type: [Object] })
    levels: Level[];

}

export type UnitDocument = Document & Unit;
export const UnitSchema = SchemaFactory.createForClass(Unit);