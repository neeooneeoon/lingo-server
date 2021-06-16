import { ProgressBook } from '@dto/progress/progressBook.dto';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Progress {

    @Prop({ type: Types.ObjectId, unique: 1 })
    userId: Types.ObjectId;

    @Prop({ type: [Object] })
    books: ProgressBook[]

}

export type ProgressDocument = Document & Progress;
export const ProgressSchema = SchemaFactory.createForClass(Progress);