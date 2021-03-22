import { Injectable } from '@nestjs/common';
import { Report, ReportDocument, ReportType } from './schema/report.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { ReportQuestion } from './dto/report.dto';
import { ReportHelper } from 'src/helper/report.helper';

@Injectable()
export class ReportService {
    constructor(
        @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
        private readonly reportHelper: ReportHelper,
        ) {}

    async sendReportQuestion(userId: string, input: ReportQuestion) {
        const { bookId, unitId, errors, comment, questionId } = input;
        const path = `${bookId}/${unitId}`;
        const report = await this.reportModel.create({
            userId: userId,
            comment: comment,
            _errors: errors,
            type: ReportType.question,
            questionId: questionId,
            path: path,
            date: new Date(),
        })
        return this.reportHelper.mapReportToResultReport(report)
    }

}