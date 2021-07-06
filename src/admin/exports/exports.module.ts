import { GoogleModule } from "@admin/google/google.module";
import { ReportsModule } from "@libs/reports";
import {  Module } from "@nestjs/common";
import { ExportsController } from "./exports.controller";
import { ExportsService } from "./exports.service";

@Module({
    imports: [GoogleModule,
    ReportsModule],
    controllers: [ExportsController],
    providers: [ExportsService],
    exports: [ExportsService]
})
export class ExportsModule {};