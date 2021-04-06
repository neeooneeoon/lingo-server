import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class MissedSpelling {

    @Prop({ type: String, required: true })
    _id: string;

    @Prop({ type: Number, required: true })
    bookNId: number;

    @Prop({ type: Number, required: true })
    unitNId: number;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: String, required: false })
    advise: string;

}

export type MissedSpellingDocument = Document & MissedSpelling;
export const MissedSpellingSchema = SchemaFactory.createForClass(MissedSpelling);