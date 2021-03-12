import { Module } from '@nestjs/common';
import { SentencesService } from './sentences.service';
import { SentencesController } from './sentences.controller';
import{ MongooseModule } from '@nestjs/mongoose';
import { Sentence, SentenceSchema } from './schema/sentence.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sentence.name, schema: SentenceSchema }
    ]),
  ],
  controllers: [SentencesController],
  providers: [SentencesService],
  exports: [SentencesService]
})
export class SentencesModule {}
