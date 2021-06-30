import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document } from 'mongoose';

@Schema({timestamps: false})
export class Word {

    @Prop({type: String})
    _id: string;

    @Prop({type: Number, required: true})
    bookNId: number;

    @Prop({type: Number, required: true})
    unitNId: number;

    @Prop({type: String, required: true})
    content: string;

    @Prop({type: String, required: true})
    meaning: string;

    @Prop({type: [String], required: true})
    meanings: string[];

    @Prop({type: [String], required: false, default: []})
    pronunciations?: string[];

    @Prop({type: [String], required: true, default: []})
    types?: string[];

    @Prop({type: String, required: false, default: ''})
    imageRoot: string;

    @Prop({type: Boolean, required: true, default: true})
    isUseToMakeQuestion: boolean;

}

export const WordSchema = SchemaFactory.createForClass(Word);
export type WordDocument = Document & Word;