import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from './schema/report.schema';
import { ReportHelper } from 'src/helper/report.helper';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Report.name, schema: ReportSchema }
        ])
    ],
    providers: [ReportService, ReportHelper],
    controllers: [ReportController],
    exports: [ReportService]
})
export class ReportModule {}