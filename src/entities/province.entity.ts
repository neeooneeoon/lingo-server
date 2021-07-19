import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Province {
  @Prop({ type: Number, required: true })
  _id: number;

  @Prop({ type: String, required: true })
  name: string;
}
export type ProvinceDocument = Document & Province;
export const ProvinceSchema = SchemaFactory.createForClass(Province);
