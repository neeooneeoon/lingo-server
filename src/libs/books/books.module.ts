import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Book, BookSchema } from './schema/book.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { ProgressesModule } from '../progresses/progresses.module';
import { WorksModule } from '../works/works.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
    ]),
    AuthenticationModule,
    ProgressesModule,
    WorksModule,
  ],
  controllers: [BooksController],
  providers: [BooksService]
})
export class BooksModule {}
