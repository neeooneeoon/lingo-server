import { Word, WordSchema } from "@entities/word.entity";
import { WordsHelper } from "@helpers/words.helper";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WordsService } from "./words.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Word.name, schema: WordSchema}
        ])
    ],
    providers: [
        WordsService,
        WordsHelper
    ],
    exports: [
        WordsService
    ],
})

export class WordsModule { };