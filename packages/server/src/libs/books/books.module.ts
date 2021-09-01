import { forwardRef, Module } from '@nestjs/common';
import { BooksController } from './controllers/books.controller';
import { BooksService } from './providers/books.service';
import { Book, BookSchema } from '@entities/book.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressesModule } from '@libs/progresses';
import { BooksHelper } from '@helpers/books.helper';
import { WorksModule } from '@libs/works';
import { QuestionHoldersModule } from '@libs/questionHolders';
import { BookPrivateService } from './private/private.service';
import { WordsModule } from '@libs/words';
import { UnitsModule } from '@libs/units/units.module';
import { SentencesModule } from '@libs/sentences';
import { CacheModule } from '@cache';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    forwardRef(() => ProgressesModule),
    WorksModule,
    WordsModule,
    SentencesModule,
    QuestionHoldersModule,
    forwardRef(() => UnitsModule),
    CacheModule,
  ],
  providers: [BooksService, BooksHelper, BookPrivateService],
  controllers: [BooksController],
  exports: [
    BooksHelper,
    BooksService,
    WorksModule,
    ProgressesModule,
    BookPrivateService,
  ],
})
export class BooksModule {}
