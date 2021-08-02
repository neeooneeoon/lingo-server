import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { StoriesService } from '../providers/stories.service';
import { StoryQuestionResults } from '@dto/stories';
import { UserCtx } from '@utils/decorators/custom.decorator';
import { JwtPayLoad } from '@utils/types';

@UseGuards(JwtAuthGuard)
@Controller('api')
@ApiBearerAuth()
@ApiTags('Stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get('api/stories/:bookId/:unitId')
  @ApiParam({ type: String, name: 'bookId', required: true })
  @ApiParam({ type: String, name: 'unitId', required: true })
  @ApiOperation({ summary: 'Lấy danh sách stories có trong book/unit' })
  public getStoriesInUnit(
    @Param('bookId') bookId: string,
    @Param('unitId') unitId,
  ) {
    return this.storiesService.getStoriesInUnit(bookId, unitId);
  }

  @Get('/story/:storyId')
  @ApiParam({ type: Number, name: 'storyId', required: true })
  @ApiOperation({ summary: 'Chi tiết story và các câu hỏi' })
  public getStoryQuestions(@Param('storyId') storyId: number) {
    return this.storiesService.getStoryQuestions(storyId);
  }

  @Put('/story/:storyId/sendResults')
  @ApiParam({ type: Number, name: 'storyId', required: true })
  @ApiBody({ type: StoryQuestionResults, required: true })
  @ApiOperation({ summary: 'Tính điểm kinh nghiệm của story question' })
  public sendStoryQuestionResults(
    @Param('storyId') storyId: number,
    @Body() body: StoryQuestionResults,
  ) {}

  @Put('story/update-xp')
  @ApiQuery({ type: Number, name: 'xp', required: true })
  @ApiOperation({ summary: 'Cập nhật xp' })
  public updateXp(@UserCtx() userCtx: JwtPayLoad, @Query('xp') xp: number) {
    return this.storiesService.updateXp(xp, userCtx.userId);
  }
}
