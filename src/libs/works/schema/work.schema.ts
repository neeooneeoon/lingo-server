import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UnitWork = {
    unitId: string;
    levels: LevelWork[];
    incorrectList: string[];
    didList: string[];
}

export type LevelWork = {
    levelIndex: number;
    lessons: LessonWork[];
    incorrectList: string[];
}

export type LessonWork = {
    lessonIndex: number;
    works: WorkResult[];
}
export type WorkResult = {
    results: any[];
    timeStart: Date;
    timeEnd: Date;
}

@Schema()
export class Work {

    @Prop({ type: Types.ObjectId })
    userId: Types.ObjectId;

    @Prop({ type: String })
    bookId: string;

    @Prop({ type: [Object] })
    units: [UnitWork]

}

export type WorkDocument = Document & Work;
export const WorkSchema = SchemaFactory.createForClass(Work);
const a: WorkDocument = undefined;
