import { QuestionHoldersModule } from "@libs/questionHolders";
import { Module } from "@nestjs/common";
import { QuestionsController } from "./controllers/questions.controller";

@Module({
    imports: [
        QuestionHoldersModule
    ],
    controllers: [QuestionsController],
    exports: [],
})

export class ManagementsModule { }