import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Word {

    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ type: Number, required: false })
    bookNId: number;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: String, required: true })
    meaning: string;

    @Prop({ type: [String], required: false })
    meanings: Array<string>;

    @Prop({ type: [String], required: false })
    pronunciations: Array<string>;

    @Prop({ type: [String], required: false })
    types: Array<string>;

    @Prop({ type: String, required: false })
    imageRoot: string;

    @Prop({ type: Boolean, required: false })
    isUseToMakeQuestion: boolean;

    @Prop({ type: [String], required: false })
    haveImageWords: Array<string>;

    @Prop({ type: [String], required: false })
    noImageWords: Array<string>;

}

export type WordDocument = Document & Word;
export const WordSchema = SchemaFactory.createForClass(Word);