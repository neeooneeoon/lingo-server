import {  Response } from "express";
import { Controller, Get, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ExportsService } from "./exports.service";

@Controller('admin/export')
@ApiTags('export')
export class ExportsController {
    constructor(private exportsService: ExportsService) { }
    @Get('users/reports')
    async exportUserReports(@Res() res: Response) {
        return this.exportsService.exportReportsToGoogleSheet(res);
    }
}