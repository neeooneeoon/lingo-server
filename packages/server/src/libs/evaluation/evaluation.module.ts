import { Module } from '@nestjs/common';
import { EvaluationService } from './providers/evaluation.service';
import { EvaluationController } from './controllers/evaluation.controller';
import { WordsModule } from '@libs/words';

@Module({
  imports: [WordsModule],
  controllers: [EvaluationController],
  providers: [EvaluationService],
  exports: [EvaluationService],
})
export class EvaluationModule {}
