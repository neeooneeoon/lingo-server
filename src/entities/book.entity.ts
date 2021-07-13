import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UnitDocument, UnitSchema } from './unit.entity';

@Schema({ timestamps: true })
export class Book {
  @Prop({ type: String })
  _id: string;

  @Prop({ type: Number, require: true })
  nId: number;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false, default: '' })
  cover?: string;

  @Prop({ type: String, default: '', required: false })
  description?: string;

  @Prop({ type: Number, required: true, min: 1, max: 12 })
  grade: number;

  @Prop({ type: String, required: false, default: '' })
  imgName?: string;

  @Prop({ type: Number, required: false })
  number?: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalWords: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalSentences: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalUnits: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalQuestions: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalLessons: number;

  @Prop({ type: [UnitSchema], default: [], required: true })
  units: UnitDocument[];
}

export const BookSchema = SchemaFactory.createForClass(Book);
export type BookDocument = Document & Book;
