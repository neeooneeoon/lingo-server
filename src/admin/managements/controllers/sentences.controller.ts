import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { SentencesService } from '@libs/sentences/sentences.service';
import { UserPermission } from '@middlewares/policy/permissions/user.permission';
import { CheckPolicies } from '@middlewares/policy/policy.decorator';
import { PoliciesGuard } from '@middlewares/policy/policy.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Action } from '@utils/enums';
import { CreateSentenceDto } from '@dto/sentence';

@UseGuards(JwtAuthGuard, PoliciesGuard)
@ApiTags('Admin')
@ApiBearerAuth()
@Controller('api/sentences')
export class SentencesController {
  constructor(private sentencesService: SentencesService) {}

  @CheckPolicies(new UserPermission(Action.Manage))
  @Get('/:bookNId/previous')
  @ApiParam({ type: Number, name: 'bookNId', required: true })
  getWordsInPrevBooks(@Param('bookNId') bookNId: number) {
    return this.sentencesService.getSentencesINPreviousBooks(bookNId);
  }

  @CheckPolicies(new UserPermission(Action.Manage))
  @Get('search')
  @ApiQuery({ type: String, required: true, name: 'content' })
  searchSentence(@Query('content') content: string) {
    return this.sentencesService.searchSentences(content);
  }

  @CheckPolicies(new UserPermission(Action.Manage))
  @Post('create')
  @ApiBody({ type: CreateSentenceDto, required: true })
  addNewSentence(@Body() body: CreateSentenceDto) {}
}
