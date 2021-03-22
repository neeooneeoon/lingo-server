import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/authentication/jwt-auth.guard';
import { ReportQuestion } from './dto/report.dto';
import { ReportService } from './report.service';
import { UserCtx } from 'src/common/custom.decorator';

@ApiTags('report')
@Controller('api/system/report')
export class ReportController {

    constructor(private readonly reportService: ReportService) {}

    @UseGuards(JwtAuthGuard)
    @Post('question')
    @ApiBearerAuth()
    @ApiBody({ type: ReportQuestion })
    systemReport(@UserCtx('user')user, @Body()body: ReportQuestion) {
        return this.reportService.sendReportQuestion(user.userId, body)
    }

}