import { ReportType } from "../schema/report.schema";

export class ReportResult {
    errors: string[];
    comment: string;
    date: Date;
    type: ReportType;
    path: string;
    questionId: string;
}