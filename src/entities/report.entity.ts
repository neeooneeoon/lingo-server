import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ReportType } from "@utils/enums";
import { Types, Document } from "mongoose";

@Schema()
export class Report {

    @Prop({type: Types.ObjectId, required: true})
    userId: Types.ObjectId;

    @Prop({type: [String], required: true, default: []})
    _errors: string[];

    @Prop({type: Date, required: true})
    date: Date;

    @Prop({type: String, enum: Object.values(ReportType)})
    reportType: ReportType;

    @Prop({type: String, required: false, default: ''})
    path?: string;

    @Prop({type: String, required: false, default: ''})
    questionId?: string;

    @Prop({type: String, required: false, default: ''})
    comment?: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
export type ReportDocument = Document & Report;