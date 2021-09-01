import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { QuestionDocument, QuestionSchema } from './question.entity';

@Schema()
export class QuestionHolder {
  @Prop({ type: String, required: true })
  bookId: string;

  @Prop({ type: String, required: true })
  unitId: string;

  @Prop({ type: Number, required: true })
  level: number;

  @Prop({ type: [QuestionSchema], required: true, default: [] })
  questions: QuestionDocument[];
}

export const QuestionHolderSchema =
  SchemaFactory.createForClass(QuestionHolder);
export type QuestionHolderDocument = Document & QuestionHolder;

QuestionHolderSchema.index(
  { bookId: 1, unitId: 1, level: 1 },
  { unique: true },
);
