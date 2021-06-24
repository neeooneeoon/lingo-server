import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { QuestionSchema, Question } from "@entities/question.entity";
import { QuestionHolderSchema, QuestionHolder } from "@entities/questionHolder.entity";
import { QuestionHoldersService } from "./providers/questionHolders.service";
import { WordsModule } from "@libs/words";
import { SentencesModule } from "@libs/sentences";
import { AnswerService } from "./providers/answer.service";
import { PointService } from "./providers/point.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Question.name, schema: QuestionSchema},
            {name: QuestionHolder.name, schema: QuestionHolderSchema},
        ]),
        WordsModule,
        SentencesModule
    ],
    controllers: [],
    providers: [
        QuestionHoldersService,
        AnswerService,
        PointService,
    ],
    exports: [
        QuestionHoldersService,
        AnswerService,
        PointService,
    ]
})
export class QuestionHoldersModule {  };
