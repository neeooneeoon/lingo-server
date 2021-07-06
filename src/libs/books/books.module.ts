import { forwardRef, Module } from "@nestjs/common";
import { BooksController } from "./controllers/books.controller";
import { BooksService } from "./providers/books.service";
import { Book, BookSchema } from "@entities/book.entity";
import { MongooseModule } from "@nestjs/mongoose";
import { ProgressesModule } from "@libs/progresses";
import { BooksHelper } from "@helpers/books.helper";
import { WorksModule } from "@libs/works";
import { QuestionHoldersModule } from "@libs/questionHolders";
import { BookPrivateService } from "./private/private.service";
import { WordsModule } from "@libs/words";


@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Book.name, schema: BookSchema},
        ]),
        forwardRef(() => ProgressesModule),
        WorksModule,
        WordsModule,
        QuestionHoldersModule,
    ],
    providers: [
        BooksService,
        BooksHelper,
        BookPrivateService,
    ],
    controllers: [BooksController],
    exports: [
        BooksService,
        WorksModule,
        ProgressesModule,
        BookPrivateService,
    ]
})
export class BooksModule {}
