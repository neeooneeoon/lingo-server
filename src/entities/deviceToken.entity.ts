import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class DeviceToken {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: String, required: false, default: '' })
  token: string;
}
export type DeviceTokenDocument = Document & DeviceToken;
export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);
