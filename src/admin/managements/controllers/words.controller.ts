import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { WordsService } from '@libs/words/words.service';
import { UserPermission } from '@middlewares/policy/permissions/user.permission';
import { CheckPolicies } from '@middlewares/policy/policy.decorator';
import { PoliciesGuard } from '@middlewares/policy/policy.guard';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Action } from '@utils/enums';

@UseGuards(JwtAuthGuard, PoliciesGuard)
@ApiTags('Admin')
@ApiBearerAuth()
@Controller('api/words')
export class WordsController {
  constructor(private wordsService: WordsService) {}

  @CheckPolicies(new UserPermission(Action.Manage))
  @Get('/:bookNId/previous')
  @ApiParam({ type: Number, name: 'bookNId', required: true })
  getWordsInPrevBooks(@Param('bookNId') bookNId: number) {
    return this.wordsService.getWordsInPreviousBooks(bookNId);
  }

  @CheckPolicies(new UserPermission(Action.Manage))
  @Get('searchWord')
  @ApiQuery({ type: String, required: true, name: 'search' })
  searchWord(@Query('search') search: string) {
    return this.wordsService.searchExactWord(search);
  }
}
