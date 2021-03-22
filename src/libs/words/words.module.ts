import { Module } from '@nestjs/common';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Word, WordSchema } from './schema/word.schema';
import { SentencesModule } from 'src/libs/sentences/sentences.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Word.name, schema: WordSchema }
    ]),
    SentencesModule
  ],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService]
})
export class WordsModule {}
