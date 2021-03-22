import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book, BookSchema } from './schema/book.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { ProgressesModule } from '../progresses/progresses.module';
import { WorksModule } from '../works/works.module';
import { QuestionHoldersModule } from 'src/libs/question-holders/question-holders.module';
import { WordsModule } from 'src/libs/words/words.module';
import { SentencesModule } from 'src/libs/sentences/sentences.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
    ]),
    AuthenticationModule,
    ProgressesModule,
    WorksModule,
    QuestionHoldersModule,
    WordsModule,
    SentencesModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService]
})
export class BooksModule {}
