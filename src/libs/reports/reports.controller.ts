import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { CreateReportDto } from "@dto/report";
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserCtx } from "@utils/decorators/custom.decorator";
import { JwtPayLoad } from "@utils/types";
import { ReportsService } from "./reports.service";

@ApiTags('Reports')
@Controller('api/report')
export class ReportsController {

    constructor(
        private reportsService: ReportsService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('sendReport')
    @ApiBearerAuth()
    @ApiOperation({summary: "Báo cáo câu hỏi"})
    @ApiBody({type: CreateReportDto, required: true, description: "Thông tin báo cáo"})
    public async sendReport(@Body('body') body: CreateReportDto, @UserCtx()user: JwtPayLoad) {
        return this.reportsService.create(user.userId, body);
    }

}