import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class Split {
    _id: string;
    wordId: string;
    text: string;
}

export class TranSlateSplit extends Split{
    isFocus: boolean
}
export class ContentSplit extends Split {
    types: [string]
}

@Schema()
export class Sentence {

    @Prop({ type: String, required: true })
    _id: String;

    @Prop({ type: String })
    baseId: String;

    @Prop({ type: Number })
    position: number;

    @Prop({ type: Number })
    bookNId: number;

    @Prop({ type: Number })
    unitNId: number;

    @Prop({ type: String })
    audio: string;

    @Prop({ type: String })
    content: string;

    @Prop({ type: String })
    translate: string;

    @Prop({ type: Boolean })
    isConversation: boolean;

    @Prop({ type: Number })
    wordBaseIndex: number;

    @Prop({ type: [TranSlateSplit] })
    translateSplit: [TranSlateSplit]

    @Prop({ type: [ContentSplit] })
    contentSplit: [ContentSplit]
}

export type SentenceDocument = Document & Sentence;
export const SentenceSchema = SchemaFactory.createForClass(Sentence);
