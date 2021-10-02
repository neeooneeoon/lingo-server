import {
  //Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
// import { EvaluationService } from '@libs/evaluation/providers/evaluation.service';
// import { UserCtx } from '@utils/decorators/custom.decorator';
// import { JwtPayLoad } from '@utils/types';
import { SaveLessonDto } from '@dto/user';

@Controller('/api/evaluation')
@ApiTags('Evaluation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class EvaluationController {
  // constructor(private readonly evaluationService: EvaluationService) {}

  @Post('addWords')
  @ApiBody({ type: SaveLessonDto, required: true })
  blackFunc() {
    return;
  }
  // addWord(@Body() body: SaveLessonDto, @UserCtx() user: JwtPayLoad) {
  //   // return this.evaluationService.addWord(user.userId, body);
  //   return;
  // }
}
