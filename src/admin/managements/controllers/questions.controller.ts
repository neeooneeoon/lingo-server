import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { BookPrivateService } from "@libs/books/private/private.service";
import { BooksService } from "@libs/books/providers/books.service";
import { UserPermission } from "@middlewares/policy/permissions/user.permission";
import { CheckPolicies } from "@middlewares/policy/policy.decorator";
import { PoliciesGuard } from "@middlewares/policy/policy.guard";
import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Action } from "@utils/enums";


@ApiTags('Admin/Question')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
@Controller('api/admin/question')
export class QuestionsController {

    constructor(
        private bookPrivateService: BookPrivateService
    ) { }

    @CheckPolicies(new UserPermission(Action.Manage))
    @Get('/:bookId/:unitId/:levelIndex/questions')
    @ApiParam({type: String, name: 'bookId', required: true})
    @ApiParam({type: String, required: true, name: 'unitId'})
    @ApiParam({type: Number, name: 'levelIndex', required: true})
    @ApiOperation({summary: 'Câu hỏi trong level'})
    getQuestion(
        @Param('bookId') bookId: string,
        @Param('unitId') unitId: string,
        @Param('levelIndex') levelIndex: number
    ) {
        return this.bookPrivateService.getQuestionsInLevel(bookId, unitId, levelIndex);
    }

}