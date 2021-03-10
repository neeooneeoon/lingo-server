import { Module } from '@nestjs/common';
import { QuestionHoldersService } from './question-holders.service';
import { QuestionHoldersController } from './question-holders.controller';

@Module({
  controllers: [QuestionHoldersController],
  providers: [QuestionHoldersService]
})
export class QuestionHoldersModule {}
