import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Report {

    @Prop({ type: Types.ObjectId })
    userId: Types.ObjectId

    @Prop({ type: String })
    comment: string;

    @Prop({ type: [String] })
    _errors: Array<string>;

    @Prop({ type: Date })
    date: Date

    @Prop({ type: String, enum: ["QUESTION"] })
    type: ReportType;

    @Prop({ type: String })
    path: string;

    @Prop({ type: String })
    questionId: string;

}

export type ReportDocument = Document & Report;
export const ReportSchema = SchemaFactory.createForClass(Report);
export enum ReportType {
    question = "QUESTION",
}