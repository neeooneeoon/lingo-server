import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { QuestionSchema, Question } from "@entities/question.entity";
import { QuestionHolderSchema, QuestionHolder } from "@entities/questionHolder.entity";
import { QuestionHoldersService } from "./questionHolders.service";
import { WordsModule } from "@libs/words";
import { SentencesModule } from "@libs/sentences";

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
    ],
    exports: [
        QuestionHoldersService,
    ]
})
export class QuestionHoldersModule {  };
