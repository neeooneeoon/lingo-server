import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StorySentence } from '@utils/types';
import { Document, Types } from 'mongoose';

@Schema()
export class Story {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  bookId: string;

  @Prop({ type: String, required: true })
  unitId: string;

  @Prop({ type: String, required: true })
  audio: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: [
      {
        _id: String,
        end: String,
        start: String,
        content: String,
        speaker: String,
        splitSentences: [
          {
            end: String,
            start: String,
            content: String,
          },
        ],
        questions: [
          {
            type: Types.ObjectId,
            ref: 'StoryQuestion',
          },
        ],
      },
    ],
  })
  sentences: StorySentence[];
}
export type StoryDocument = Document & Story;
export const StorySchema = SchemaFactory.createForClass(Story);
