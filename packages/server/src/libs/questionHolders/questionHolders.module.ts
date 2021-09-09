import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionSchema, Question } from '@entities/question.entity';
import {
  QuestionHolderSchema,
  QuestionHolder,
} from '@entities/questionHolder.entity';
import { QuestionHoldersService } from './providers/questionHolders.service';
import { WordsModule } from '@libs/words';
import { SentencesModule } from '@libs/sentences';
import { AnswerService } from './providers/answer.service';
import { PointService } from './providers/point.service';
import { QuestionsHelper } from '@helpers/questionsHelper';
import { Unit, UnitSchema } from '@entities/unit.entity';
import { CacheModule } from '@cache';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: QuestionHolder.name, schema: QuestionHolderSchema },
      { name: Unit.name, schema: UnitSchema },
    ]),
    WordsModule,
    SentencesModule,
    CacheModule,
  ],
  controllers: [],
  providers: [
    QuestionHoldersService,
    AnswerService,
    PointService,
    QuestionsHelper,
  ],
  exports: [
    QuestionHoldersService,
    AnswerService,
    PointService,
    QuestionsHelper,
  ],
})
export class QuestionHoldersModule {}
