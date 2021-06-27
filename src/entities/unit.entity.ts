import { UnitLevel } from "@dto/unit";
import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({timestamps: true})
export class Unit {

    @Prop({type: String})
    _id: string;

    @Prop({type: Number, required: true})
    nId: number;

    @Prop({type: Number, required: true})
    unitIndex: number;

    @Prop({type: String, required: false})
    key?: string;

    @Prop({type: String, required: true})
    name: string;

    @Prop({ type: String, default: "", required: false })
    description?: string;

    @Prop({type: Number, required: true, default: 0})
    totalLevels: number;

    @Prop({type: Number, required: true, default: 0})
    totalLessons: number;

    @Prop({type: String, required: false, default: ""})
    grammar: string;

    @Prop({type: String, required: false, default: ""})
    tips: string;

    @Prop({type: [String], required: true, default: []})
    wordIds: string[];

    @Prop({type: [String], required: true, default: []})
    sentenceIds: string[];

    @Prop({type: [{
        levelIndex: Number,
        totalLessons: Number,
        totalQuestions: Number,
        lessons:[{
            lessonIndex: Number,
            totalQuestions: Number,
            questionIds: [String]
        }]
    }]})
    levels: UnitLevel[];
}

export const UnitSchema = SchemaFactory.createForClass(Unit);
export type UnitDocument = Document & Unit;