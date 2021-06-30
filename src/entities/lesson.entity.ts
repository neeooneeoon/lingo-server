import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Lesson {

    @Prop({type: Number, required: true, default: 0})
    totalQuestions: number;

    @Prop({type: Number, required: true})
    lessonIndex: number;

    @Prop({type: [String], required: true, default: []})
    questionIds: string[];

    @Prop({type: [Object], required: true, immutable: false})
    questions: any;
}

export const LessonSchema = SchemaFactory.createForClass(Lesson);
export type LessonDocument = Document & Lesson;
