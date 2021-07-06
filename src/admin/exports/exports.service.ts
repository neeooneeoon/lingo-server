import { GoogleService } from "@admin/google/google.service";
import { ReportsService } from "@libs/reports/reports.service";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import {  Response } from "express";
import { google } from "googleapis";
@Injectable()
export class ExportsService {
    constructor(
        @Inject(forwardRef(() => GoogleService)) private googleService: GoogleService,
        private reportsService: ReportsService
    ) { }
    public async exportReportsToGoogleSheet(res: Response) {
    try {
        const link = "https://docs.google.com/spreadsheets/d/1itV_02p_yUWtxxzQC7K35gi0jLF6P-9ZWAmM-1zXvME/edit#gid=255187458";
        const client = await this.googleService.Authorize();
        const sheets = google.sheets({ version: "v4", auth: client });
        const sheetData = await this.reportsService.exportUserReports();
        if (sheetData && sheetData.length > 0) {
            await this.googleService.clearSheets(sheets, process.env.REPORT_SHEET, "Report");
            await this.googleService.updateSheet(sheets, process.env.REPORT_SHEET, "Report", sheetData);
        }
        if (sheetData) {
            res.writeHead(200, {
                "Content-Type": "text/html"
            });
            res.write(`
                    <a href="${link}" target='_blank'>Click here to view reports.</a>
                `);
            res.end();
            return res;
        } else {
            return res.sendStatus(400);
        }
    } catch (error) {
        throw new Error(error);
    }
}
}