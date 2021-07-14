import { Sentence, SentenceSchema } from '@entities/sentence.entity';
import { SentencesHelper } from '@helpers/sentences.helper';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SentencesService } from './sentences.service';
import {
  DistractedSentence,
  DistractedSentenceSchema,
} from '@entities/distractedSentence.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sentence.name, schema: SentenceSchema },
      { name: DistractedSentence.name, schema: DistractedSentenceSchema },
    ]),
  ],
  providers: [SentencesService, SentencesHelper],
  exports: [SentencesService],
})
export class SentencesModule {}
