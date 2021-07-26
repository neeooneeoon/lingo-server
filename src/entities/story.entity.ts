import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StorySentence } from '@utils/types';
import { Document } from 'mongoose';

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
      },
    ],
  })
  sentences: StorySentence;
}
export type StoryDocument = Document & Story;
export const StorySchema = SchemaFactory.createForClass(Story);
StorySchema.index({ bookId: 1, unitId: 1 });
