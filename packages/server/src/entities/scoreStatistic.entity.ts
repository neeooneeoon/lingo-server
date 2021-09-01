import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ScoreStatistic {
  @Prop({ type: Types.ObjectId, required: true, default: '', ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: Number, require: true, default: 0 })
  xp: number;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ScoreStatisticSchema =
  SchemaFactory.createForClass(ScoreStatistic);
export type ScoreStatisticDocument = Document & ScoreStatistic;
ScoreStatisticSchema.index({ createdAt: 1 }, { unique: true });
