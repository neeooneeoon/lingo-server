import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { StoriesService } from '../providers/stories.service';

@UseGuards(JwtAuthGuard)
@Controller('api/stories')
@ApiBearerAuth()
@ApiTags('Stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get('/:bookId/:unitId')
  @ApiParam({ type: String, name: 'bookId', required: true })
  @ApiParam({ type: String, name: 'unitId', required: true })
  @ApiOperation({ summary: 'Lấy danh sách stories có trong book/unit' })
  public getStoriesInUnit(
    @Param('bookId') bookId: string,
    @Param('unitId') unitId,
  ) {
    return this.storiesService.getStoriesInUnit(bookId, unitId);
  }
}
