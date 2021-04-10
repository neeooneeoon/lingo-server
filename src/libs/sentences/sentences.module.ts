import { Module } from '@nestjs/common';
import { SentencesService } from './sentences.service';
import { SentencesController } from './sentences.controller';
import{ MongooseModule } from '@nestjs/mongoose';
import { Sentence, SentenceSchema } from './schema/sentence.schema';
import { ExtendHelper } from 'src/helper/extendHelper';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sentence.name, schema: SentenceSchema }
    ]),
  ],
  controllers: [SentencesController],
  providers: [SentencesService, ExtendHelper],
  exports: [SentencesService]
})
export class SentencesModule {}
