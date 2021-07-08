import { Book, BookSchema } from "@entities/book.entity";
import { BooksModule } from "@libs/books";
import { SentencesModule } from "@libs/sentences";
import { WordsModule } from "@libs/words";
import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UnitsService } from "./units.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Book.name, schema: BookSchema}
        ]),
        forwardRef(() => BooksModule),
        WordsModule,
        SentencesModule
    ],
    providers: [UnitsService],
    exports: [UnitsService]
})
export class UnitsModule { }