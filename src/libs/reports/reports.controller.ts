import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Reports')
@Controller()
export class ReportsController {

    @Post('sendReport')
    public async sendReport(@Body('body') body: any) {
        
    }
}