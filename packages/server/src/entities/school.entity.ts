import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class School {
  @Prop({ type: Number, required: true })
  _id: number;
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: Number, required: true })
  province: number;
  @Prop({ type: Number, required: true })
  district: number;
}
export type SchoolDocument = School & Document;
export const SchoolSchema = SchemaFactory.createForClass(School);
SchoolSchema.index({ province: 1, district: 1 });
