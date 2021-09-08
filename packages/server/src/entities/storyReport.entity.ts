import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class StoryReport {
  @ApiProperty({ type: String })
  @Prop({ type: Types.ObjectId, ref: 'StoryQuestion', required: true })
  storyQuestion: Types.ObjectId;

  @ApiProperty({ type: [String] })
  @Prop({ type: [String], required: false, default: [] })
  contents?: Array<string>;

  @ApiProperty({ type: String })
  @Prop({ type: String, required: false, default: '' })
  comment?: string;

  @ApiProperty({ type: Date })
  @Prop({ type: Date, required: false })
  createdAt?: Date;

  @ApiProperty({ type: Date })
  @Prop({ type: Date, required: false })
  updatedAt?: Date;
}

export type StoryReportDocument = Document & StoryReport;
export const StoryReportSchema = SchemaFactory.createForClass(StoryReport);
