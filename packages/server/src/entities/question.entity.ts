import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QuestionTypeCode } from '@lingo/core/src/utils/enums';
import { Document } from 'mongoose';

@Schema()
export class Question {
  @Prop({ type: String })
  _id: string;

  @Prop({
    type: [
      {
        _id: String,
        active: Boolean,
      },
    ],
    required: true,
    default: [],
  })
  choices: { _id: string; active: boolean }[];

  @Prop({ type: String, required: true })
  focus: string;

  @Prop({ type: Number, required: true, default: -1 })
  hiddenIndex: number;

  @Prop({ type: Number, required: false })
  rank?: number;

  @Prop({ type: String, enum: Object.values(QuestionTypeCode), required: true })
  code: QuestionTypeCode;

  @Prop({ type: String, required: false })
  wordId?: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
export type QuestionDocument = Document & Question;
