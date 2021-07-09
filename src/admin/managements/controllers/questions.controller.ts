import { map, switchMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { JwtAuthGuard } from "@authentication/guard/jwtAuth.guard";
import { RemoveChoiceDto } from "@dto/questionHolder";
import { AddChoiceDto } from "@dto/questionHolder/removeChoice.dto";
import { BookPrivateService } from "@libs/books/private/private.service";
import { QuestionHoldersService } from "@libs/questionHolders/providers/questionHolders.service";
import { WordsService } from "@libs/words/words.service";
import { UserPermission } from "@middlewares/policy/permissions/user.permission";
import { CheckPolicies } from "@middlewares/policy/policy.decorator";
import { PoliciesGuard } from "@middlewares/policy/policy.guard";
import { Body, Controller, Get, Param, Put, UseGuards, BadRequestException } from "@nestjs/common";
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
        private wordsService: WordsService,
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
    @Put('/:bookId/:unitId/:levelIndex/toggleChoice')
    @ApiBody({type: RemoveChoiceDto})
    @ApiParam({type: String, name: 'bookId', required: true})
    @ApiParam({type: String, required: true, name: 'unitId'})
    @ApiParam({type: Number, name: 'levelIndex', required: true})
    toggleChoice(
        @Param('bookId') bookId: string,
        @Param('unitId') unitId: string,
        @Param('levelIndex') levelIndex: number,
        @Body()body: RemoveChoiceDto
        ) {
        return this.questionService.toggleChoice({
            bookId: bookId,
            unitId: unitId,
            levelIndex: levelIndex,
            questionId: body.questionId,
            choiceId: body.choiceId
        })
    }
    @CheckPolicies(new UserPermission(Action.Manage))
    @Put('/:bookId/:unitId/:levelIndex/addChoice')
    @ApiBody({type: AddChoiceDto})
    @ApiParam({type: String, name: 'bookId', required: true})
    @ApiParam({type: String, required: true, name: 'unitId'})
    @ApiParam({type: Number, name: 'levelIndex', required: true})
    addChoice(
        @Param('bookId') bookId: string,
        @Param('unitId') unitId: string,
        @Param('levelIndex') levelIndex: number,
        @Body()body: AddChoiceDto
        ) {
            return from(
                this.wordsService
                .searchExactWord(body.content)
            )
            .pipe(
                map(word => {
                    if (!word) {
                        throw new BadRequestException('Can not find word')
                    }
                    return word
                }),
                switchMap((word) => {
                    return this.questionService.addChoice({
                        bookId: bookId,
                        unitId: unitId,
                        levelIndex: levelIndex,
                        questionId: body.questionId,
                        choiceId: String(word._id),
                        word: word
                    });
                })
            )
        // return this.questionService.addChoice({
        //     bookId: bookId,
        //     unitId: unitId,
        //     levelIndex: levelIndex,
        //     questionId: body.questionId,
        //     choiceId: body.choiceId
        // })
    }

}