import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Notification as NotificationEnum } from '@utils/enums';

@Schema()
export class Notification {
  @Prop({ type: String, required: false, default: '' })
  tag?: string;

  @Prop({ type: String, required: false, default: '' })
  body?: string;

  @Prop({ type: String, required: false, default: '' })
  icon?: string;

  @Prop({ type: String, required: false, default: '' })
  badge?: string;

  @Prop({ type: String, required: false, default: '' })
  color?: string;

  @Prop({ type: String, required: false, default: '' })
  sound?: string;

  @Prop({ type: String, required: false, default: '' })
  title?: string;

  @Prop({ type: String, required: false, default: '' })
  bodyLocKey?: string;

  @Prop({ type: String, required: false, default: '' })
  bodyLocArgs?: string;

  @Prop({ type: String, required: false, default: '' })
  clickAction?: string;

  @Prop({ type: String, required: false, default: '' })
  titleLocKey?: string;

  @Prop({ type: String, required: false, default: '' })
  titleLocArgs?: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(NotificationEnum),
    unique: true,
  })
  hashCode: NotificationEnum;
}

export type NotificationDocument = Document & Notification;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
