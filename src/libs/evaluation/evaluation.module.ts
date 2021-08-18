import { Module } from '@nestjs/common';
import { EvaluationService } from './providers/evaluation.service';
import { EvaluationController } from './controllers/evaluation.controller';

@Module({
  imports: [],
  controllers: [EvaluationController],
  providers: [EvaluationService],
  exports: [EvaluationService],
})
export class EvaluationModule {}
