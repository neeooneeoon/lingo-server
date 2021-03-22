import { Module } from '@nestjs/common';
import { WorksService } from './works.service';
import { WorksController } from './works.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Work, WorkSchema } from './schema/work.schema';
import { QuestionHoldersModule } from 'src/libs/question-holders/question-holders.module';
import { WordsModule } from 'src/libs/words/words.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Work.name, schema: WorkSchema }
    ]),
    QuestionHoldersModule,
    WordsModule,
  ],
  controllers: [WorksController],
  providers: [WorksService],
  exports: [WorksService]
})
export class WorksModule {}
