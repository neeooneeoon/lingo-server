import { BooksModule } from "@libs/books";
import { Module } from "@nestjs/common";
import { QuestionsController } from "./controllers/questions.controller";

@Module({
    imports: [
        BooksModule
    ],
    controllers: [QuestionsController],
    exports: [],
})

export class ManagementsModule { }