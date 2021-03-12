import { Module } from '@nestjs/common';
import { QuestionHoldersService } from './question-holders.service';
import { QuestionHoldersController } from './question-holders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionHolder, QuestionHolderSchema } from './schema/question-holder.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuestionHolder.name, schema: QuestionHolderSchema }
    ]),
  ],
  controllers: [QuestionHoldersController],
  providers: [QuestionHoldersService],
  exports: [QuestionHoldersService]
})
export class QuestionHoldersModule {}
