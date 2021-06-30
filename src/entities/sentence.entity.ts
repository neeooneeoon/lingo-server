import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Sentence {

    @Prop({type: String})
    _id: string;

    @Prop({type: String, required: true, default: '',})
    baseId: string;

    @Prop({type: Number, required: true})
    bookNId: number;

    @Prop({type: Number, required: true})
    unitNId: number;

    @Prop({type: String, required: false, default: ''})
    audio?: string;

    @Prop({type: String, required: true, default: ''})
    content: string;

    @Prop({type: String, required: true, default: ''})
    translate: string;

    @Prop({type: [String], required: true, default: []})
    translates: string[];

    @Prop({type: Boolean, required: true, default: false})
    isConversation: boolean;

    @Prop({type: Number, required: true, default: -1})
    wordBaseIndex: number;

    @Prop({
        type: [{
            _id: String,
            wordId: String,
            text: String,
            isFocus: Boolean
        }]
    })
    translateSplit: [{
        _id: string,
        wordId: string,
        text: string,
        isFocus: boolean
    }];

    @Prop({
        type: [{
            _id: String,
            wordId: String,
            text: String,
            types: [String]
        }]
    })
    contentSplit: [{
        _id: string,
        wordId: string,
        text: string,
        types: string[]
    }]

    @Prop({type: String, required: true, default: ''})
    questionSection: string;

    @Prop({type: String, required: true, default: ''})
    contextSection: string;

    @Prop({type: Number, required: true, default: 0})
    lowerBound: number;

    @Prop({type: Number, required: true, default: 0})
    upperBound: number;
    
}

export const SentenceSchema = SchemaFactory.createForClass(Sentence);
export type SentenceDocument = Document & Sentence;