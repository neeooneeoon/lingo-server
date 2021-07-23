import { map, switchMap } from 'rxjs/operators';
import { forkJoin, from } from 'rxjs';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { RemoveChoiceDto } from '@dto/questionHolder';
import { AddChoiceDto } from '@dto/questionHolder/removeChoice.dto';
import { BookPrivateService } from '@libs/books/private/private.service';
import { QuestionHoldersService } from '@libs/questionHolders/providers/questionHolders.service';
import { WordsService } from '@libs/words/words.service';
import { UserPermission } from '@middlewares/policy/permissions/user.permission';
import { CheckPolicies } from '@middlewares/policy/policy.decorator';
import { PoliciesGuard } from '@middlewares/policy/policy.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Action, QuestionTypeCode } from '@utils/enums';
import { SentencesService } from '@libs/sentences/sentences.service';
import { CreateSentenceDto } from '@dto/sentence';
import { BackupsService } from '@libs/backups/providers/backups.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PoliciesGuard)
@Controller('api/admin/question')
export class QuestionsController {
  constructor(
    private bookPrivateService: BookPrivateService,
    private questionService: QuestionHoldersService,
    private wordsService: WordsService,
    private sentencesService: SentencesService,
    private backupsService: BackupsService,
  ) {}

  @CheckPolicies(new UserPermission(Action.Manage))
  @Get('/:bookId/:unitId/:levelIndex/questions')
  @ApiParam({ type: String, name: 'bookId', required: true })
  @ApiParam({ type: String, required: true, name: 'unitId' })
  @ApiParam({ type: Number, name: 'levelIndex', required: true })
  @ApiOperation({ summary: 'Câu hỏi trong level' })
  getQuestion(
    @Param('bookId') bookId: string,
    @Param('unitId') unitId: string,
    @Param('levelIndex') levelIndex: number,
  ) {
    return this.bookPrivateService.getQuestionsInLevel(
      bookId,
      unitId,
      levelIndex,
    );
  }

  @CheckPolicies(new UserPermission(Action.Manage))
  @Put('/:bookId/:unitId/:levelIndex/toggleChoice')
  @ApiBody({ type: RemoveChoiceDto })
  @ApiParam({ type: String, name: 'bookId', required: true })
  @ApiParam({ type: String, required: true, name: 'unitId' })
  @ApiParam({ type: Number, name: 'levelIndex', required: true })
  toggleChoice(
    @Param('bookId') bookId: string,
    @Param('unitId') unitId: string,
    @Param('levelIndex') levelIndex: number,
    @Body() body: RemoveChoiceDto,
  ) {
    return this.questionService
      .toggleChoice({
        bookId: bookId,
        unitId: unitId,
        levelIndex: levelIndex,
        questionId: body.questionId,
        choiceId: body.choiceId,
      })
      .pipe(
        switchMap(({ choice, focusQuestion }) => {
          return this.backupsService.restore({
            bookId: bookId,
            unitId: unitId,
            levelIndex: levelIndex,
            focusId: focusQuestion.focus,
            choiceId: choice._id,
            content: '',
            meaning: '',
            code: focusQuestion.code,
            newInstance: false,
            active: choice.active,
          });
        }),
      );
  }

  @CheckPolicies(new UserPermission(Action.Manage))
  @Put('/:bookId/:unitId/:levelIndex/addChoice')
  @ApiBody({ type: AddChoiceDto })
  @ApiParam({ type: String, name: 'bookId', required: true })
  @ApiParam({ type: String, required: true, name: 'unitId' })
  @ApiParam({ type: Number, name: 'levelIndex', required: true })
  addChoice(
    @Param('bookId') bookId: string,
    @Param('unitId') unitId: string,
    @Param('levelIndex') levelIndex: number,
    @Body() body: AddChoiceDto,
  ) {
    return from(
      this.wordsService.searchExactWord(body.content).pipe(
        map((word) => word),
        switchMap((word) => {
          return forkJoin([
            this.backupsService.restore({
              bookId: bookId,
              unitId: unitId,
              levelIndex: levelIndex,
              focusId: body.focusId,
              choiceId: word._id,
              content: word.content,
              meaning: word.meaning,
              code: body.code,
              newInstance: false,
              active: true,
            }),
            this.questionService.addChoice({
              bookId: bookId,
              unitId: unitId,
              levelIndex: levelIndex,
              questionId: body.questionId,
              choiceId:
                body.code !== QuestionTypeCode.S7 ? word._id : word.content,
              word: word,
            }),
          ]);
        }),
        map(([backupResult, addChoiceResult]) => {
          if (!backupResult) throw new BadRequestException('Backup failed.');
          return addChoiceResult;
        }),
      ),
    );
  }

  @CheckPolicies(new UserPermission(Action.Manage))
  @Put('/:bookId/:unitId/:levelIndex/addNewSentence')
  @ApiBody({ type: CreateSentenceDto, required: true })
  @ApiParam({ type: String, name: 'bookId', required: true })
  @ApiParam({ type: String, required: true, name: 'unitId' })
  @ApiParam({ type: Number, name: 'levelIndex', required: true })
  addNewSentence(
    @Param('bookId') bookId: string,
    @Param('unitId') unitId: string,
    @Param('levelIndex') levelIndex: number,
    @Body() body: CreateSentenceDto,
  ) {
    return from(
      this.sentencesService.addNewSentence({
        content: body.content,
        meaning: body?.meaning,
        audio: body?.audio,
      }),
    ).pipe(
      switchMap((sentence) => {
        if (!sentence) {
          throw new BadRequestException();
        }
        return forkJoin([
          this.backupsService.restore({
            bookId: bookId,
            unitId: unitId,
            levelIndex: levelIndex,
            focusId: body.focusId,
            choiceId: sentence._id,
            content: sentence.content,
            meaning: sentence.translate,
            audio: sentence.audio,
            code: body.code,
            newInstance: true,
            active: true,
          }),
          this.questionService.addChoice({
            bookId: bookId,
            unitId: unitId,
            levelIndex: levelIndex,
            questionId: body.questionId,
            choiceId: String(sentence._id),
            sentence: sentence,
          }),
        ]);
      }),
      map(([backupResult, addChoiceResult]) => {
        if (!backupResult) throw new BadRequestException();
        return addChoiceResult;
      }),
    );
  }
}
