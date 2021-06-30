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
}