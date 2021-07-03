import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({timestamps: true})
export class Tag {

    @Prop({type: String, auto: false})
    _id: string;

    @Prop({type: Types.ObjectId, required: true})
    user: Types.ObjectId;

    @Prop({type: String, required: true})
    name: string;

    @Prop({type: String, required: true})
    color: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
export type TagDocument = Document & Tag;
