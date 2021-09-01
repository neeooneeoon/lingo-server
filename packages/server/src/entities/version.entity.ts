import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Version {
  @Prop({ type: String, required: false, default: '' })
  description: string;

  @Prop({ type: String, required: true })
  tag: string;
}
export type VersionDocument = Document & Version;
export const VersionSchema = SchemaFactory.createForClass(Version);
