import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { ActiveBookProgress  } from "@dto/progress";
import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ProgressesService } from "./progresses.service";

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Progresses')
@Controller('api/progress')
export class ProgressesController {

    constructor(
        private readonly progressesService: ProgressesService,
    ) { }

    @Get('/:userId/books')
    @ApiResponse({type: [ActiveBookProgress], status: 200})
    @ApiParam({type: String, required: true, name: 'userId'})
    @ApiOperation({summary: 'Thông tin các cuốn sách học gần đây nhất (tối đa 5)'})
    @ApiResponse({type: [ActiveBookProgress], status: 200})
    public latestActiveBook(@Param('userId') userId: string) {
        return this.progressesService.latestActiveBookProgress(userId)
    }

}