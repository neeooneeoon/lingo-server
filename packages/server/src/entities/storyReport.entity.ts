import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class StoryReport {
  @Prop({ type: Types.ObjectId, ref: 'StoryQuestion', required: true })
  storyQuestion: Types.ObjectId;

  @Prop
}
