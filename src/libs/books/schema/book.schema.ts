import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsInt, Min, Max } from 'class-validator';
import { UnitSchema, UnitDocument } from 'src/libs/units/schema/unit.schema';

@Schema({ timestamps: true })
export class Book {

    @Prop({ type: String, required: true })
    _id: string;

    @IsInt()
    @Prop({type: Number, required: true })
    nId: number;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: String })
    cover: string;

    @Prop({ type: String, default: "" })
    description: string;

    @Min(1)
    @Max(12)
    @Prop({ type: Number, required: true })
    grade: number;

    @Prop({ type: String })
    imgName: string;

    @Prop({ type: Number })
    number: number;

    @IsInt()
    @Prop({ type: Number, required: true, default: 0 })
    totalWords: number

    @IsInt()
    @Prop({ type: Number, required: true, default: 0 })
    totalSentences: number;

    @IsInt()
    @Prop({ type: Number, required: true })
    totalUnits: number;

    @IsInt()
    @Prop({ type: Number, required: true, default: 0 })
    totalQuestions: number;

    @IsInt()
    @Prop({ type: Number, required: true, default: 0 })
    totalLessons: number;
    
    @Prop({ type: [Object] })
    units: [UnitDocument]
}

export type BookDocument = Document & Book;
export const BookSchema = SchemaFactory.createForClass(Book);