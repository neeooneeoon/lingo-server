import { Model, Types } from 'mongoose';
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Report, ReportDocument } from '@entities/report.entity';
import { CreateReportDto } from '@dto/report';
import { ReportType } from '@utils/enums';

@Injectable()
export class ReportsService {
    
    constructor(
        @InjectModel(Report.name) private reportModel: Model<ReportDocument>
    ) { }

    public async create(userId: string, input: CreateReportDto): Promise<ReportDocument> {
        try {
            const {
                bookId,
                unitId,
                errors,
                comment,
                questionId,
                level,
                lesson
            } = input;

            const path = `${bookId}/${unitId}/${level}/${lesson}`;

            const newReport = await this.reportModel.create({
                userId: Types.ObjectId(userId),
                comment: comment,
                _errors: errors,
                reportType: ReportType.Question,
                questionId: questionId,
                path: path,
                date: new Date()
            });
            return newReport;
            
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
    public async exportUserReports() {
        try {
            const listReports = await this.reportModel.find();
            if (listReports && listReports.length > 0) {
                const root: Array<Array<string>> = [];
                const columnTitles = ["id", "questionId", "userId", "comment", "error", "type", "path", "date"];
    
                root.push(columnTitles);
                const reportData: string[][] = listReports.map((report) => {
                    const data: Array<string> = [
                        report._id,
                        report.questionId,
                        report.userId,
                        report.comment,
                        report._errors.join("\n").toString(),
                        report.reportType,
                        report.path,
                        report.date
                    ];
                    return data;
                });
                return [...root, ...reportData];
            }
        }
        catch(e) {
            throw new Error(e);
        }
    }
}