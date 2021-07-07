import { BooksModule } from "@libs/books";
import { SentencesModule } from "@libs/sentences";
import { WordsModule } from "@libs/words";
import { Module } from "@nestjs/common";
import { QuestionsController } from "./controllers/questions.controller";
import { SentencesController } from "./controllers/sentences.controller";
import { WordsController } from "./controllers/words.controller";

@Module({
    imports: [
        BooksModule,
        WordsModule,
        SentencesModule,
    ],
    controllers: [
        QuestionsController,
        WordsController,
        SentencesController,

    ],
    exports: [],
})

export class ManagementsModule { }