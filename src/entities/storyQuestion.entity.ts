import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QuestionTypeCode } from '@utils/enums';
import { Document } from 'mongoose';

@Schema()
export class StoryQuestion {
  @Prop({ type: String, required: true, enum: Object.values(QuestionTypeCode) })
  code: QuestionTypeCode;

  @Prop({ type: String, required: true, default: '' })
  content?: string;

  @Prop({ type: Number, required: true, default: -1 })
  hiddenIndex: number;

  @Prop({ type: String, required: false, default: '' })
  focus?: string;

  @Prop({
    type: [
      {
        _id: String,
        active: Boolean,
      },
    ],
    required: false,
    default: [],
  })
  choices: Array<{ _id: string; active: boolean }>;

  @Prop({
    type: [
      {
        _id: String,
        text: Boolean,
      },
    ],
    required: false,
    default: [],
  })
  contentSplit: Array<{ _id: string; text: string }>;

  @Prop({ type: Number, required: true, ref: 'Story' })
  story: number;

  @Prop({ type: Number, required: true, ref: 'Story.sentences' })
  sentence: string;
}
export type StoryQuestionDocument = StoryQuestion & Document;
export const StoryQuestionSchema = SchemaFactory.createForClass(StoryQuestion);
