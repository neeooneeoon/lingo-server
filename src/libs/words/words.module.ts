import { Module } from '@nestjs/common';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Word, WordSchema } from './schema/word.schema';
import { SentencesModule } from 'src/libs/sentences/sentences.module';
import { MissedSpelling, MissedSpellingSchema } from './schema/missedSpelling.schema';
import { ExtendHelper } from 'src/helper/extendHelper';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Word.name, schema: WordSchema },
      { name: MissedSpelling.name, schema: MissedSpellingSchema }
    ]),
    SentencesModule
  ],
  controllers: [WordsController],
  providers: [WordsService, ExtendHelper],
  exports: [WordsService]
})
export class WordsModule {}
