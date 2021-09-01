import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DistractedSentence {
  @Prop({ type: String })
  _id: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  meaning: string;

  @Prop({ type: String, required: true, default: '' })
  audio?: string;

  @Prop({ type: String, required: true })
  bookId: string;

  @Prop({ type: String, required: true })
  unitId: string;

  @Prop({ type: String, ref: 'Sentence' })
  sentence: string;
}

export type DistractedSentenceDocument = Document & DistractedSentence;
export const DistractedSentenceSchema =
  SchemaFactory.createForClass(DistractedSentence);
