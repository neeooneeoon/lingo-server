import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Following {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  followUser: Types.ObjectId;

  @Prop({
    type: [
      {
        type: String,
        required: false,
        ref: 'Tag',
      },
    ],
    default: [],
  })
  tags: string[];
}

export const FollowingSchema = SchemaFactory.createForClass(Following);
export type FollowingDocument = Document & Following;

FollowingSchema.index({ user: 1, followUser: 1 }, { unique: true });
