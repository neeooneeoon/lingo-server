import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { EvaluationService } from '@libs/evaluation/providers/evaluation.service';
import { AddWordDto } from '@dto/evaluation';
import { UserCtx } from '@utils/decorators/custom.decorator';
import { JwtPayLoad } from '@utils/types';

@Controller('/api/evaluation')
@ApiTags('Evaluation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post('addWord')
  @ApiBody({ type: AddWordDto, required: true })
  addWord(@Body() body: AddWordDto, @UserCtx() user: JwtPayLoad) {
    return this.evaluationService.addWord(user.userId, [body]);
  }
}
