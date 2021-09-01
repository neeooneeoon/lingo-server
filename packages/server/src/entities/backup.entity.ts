import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QuestionTypeCode } from '@utils/enums';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Backup {
  @Prop({ type: String, required: true })
  bookId: string;

  @Prop({ type: String, required: true })
  unitId: string;

  @Prop({ type: Number, required: true })
  levelIndex: number;

  @Prop({ type: String, required: true })
  focusId: string;

  @Prop({ type: String, required: true })
  choiceId: string;

  @Prop({ type: String, required: false, default: '' })
  content?: string;

  @Prop({ type: String, required: false, default: '' })
  meaning?: string;

  @Prop({ type: String, required: false, default: '' })
  imageRoot?: string;

  @Prop({ type: String, required: false, default: '' })
  audio?: string;

  @Prop({ type: String, required: true, enum: Object.values(QuestionTypeCode) })
  code: QuestionTypeCode;

  @Prop({ type: Boolean, required: true })
  newInstance: boolean;

  @Prop({ type: Boolean, required: true })
  active: boolean;
}
export type BackupDocument = Document & Backup;
export const BackupSchema = SchemaFactory.createForClass(Backup);
