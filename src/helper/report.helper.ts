import { ReportDocument } from 'src/libs/report/schema/report.schema';
import { ReportResult } from 'src/libs/report/dto/report-result.dto';

export class ReportHelper {
    mapReportToResultReport(report: ReportDocument): ReportResult {
        return {
            errors: report._errors,
            comment: report.comment,
            date: report.date,
            type: report.type,
            path: report.path,
            questionId: report.questionId,
        }
    }
}