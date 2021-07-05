import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiTags } from "@nestjs/swagger";
import { ProgressesService } from "./progresses.service";

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Progresses')
@Controller('api/progress')
export class ProgressesController {

    constructor(
        private readonly progressesService: ProgressesService,
    ) { }

    @Get('/:userId/viewProgress')
    @ApiParam({type: String, required: true, name: 'userId'})
    public latestActiveBook(@Param('userId') userId: string) {

    }
}