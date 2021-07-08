import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { RemoveChoiceDto } from "@dto/questionHolder";
import { BookPrivateService } from "@libs/books/private/private.service";
import { QuestionHoldersService } from "@libs/questionHolders/providers/questionHolders.service";
import { UserPermission } from "@middlewares/policy/permissions/user.permission";
import { CheckPolicies } from "@middlewares/policy/policy.decorator";
import { PoliciesGuard } from "@middlewares/policy/policy.guard";
import { Body, Controller, Get, Param, Put, UseGuards, } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { Action } from "@utils/enums";


@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
@Controller('api/admin/question')
export class QuestionsController {

    constructor(
        private bookPrivateService: BookPrivateService,
        private questionService: QuestionHoldersService,
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

    @CheckPolicies(new UserPermission(Action.Manage))
    @Put('/:bookId/:unitId/:levelIndex/removeChoice')
    @ApiBody({type: RemoveChoiceDto})
    @ApiParam({type: String, name: 'bookId', required: true})
    @ApiParam({type: String, required: true, name: 'unitId'})
    @ApiParam({type: Number, name: 'levelIndex', required: true})
    removeChoice(
        @Param('bookId') bookId: string,
        @Param('unitId') unitId: string,
        @Param('levelIndex') levelIndex: number,
        @Body()body: RemoveChoiceDto
        ) {
        return this.questionService.removeChoice({
            bookId: bookId,
            unitId: unitId,
            levelIndex: levelIndex,
            questionId: body.questionId,
            choiceId: body.choiceId
        })
    }
    @CheckPolicies(new UserPermission(Action.Manage))
    @Put('/:bookId/:unitId/:levelIndex/addChoice')
    @ApiBody({type: RemoveChoiceDto})
    @ApiParam({type: String, name: 'bookId', required: true})
    @ApiParam({type: String, required: true, name: 'unitId'})
    @ApiParam({type: Number, name: 'levelIndex', required: true})
    addChoice(
        @Param('bookId') bookId: string,
        @Param('unitId') unitId: string,
        @Param('levelIndex') levelIndex: number,
        @Body()body: RemoveChoiceDto
        ) {
        return this.questionService.addChoice({
            bookId: bookId,
            unitId: unitId,
            levelIndex: levelIndex,
            questionId: body.questionId,
            choiceId: body.choiceId
        })
    }

}