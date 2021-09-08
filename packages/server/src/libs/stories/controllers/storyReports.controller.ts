import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';

@Controller('api/story')
@ApiTags('Stories')
export class StoryReportsController {
  @UseGuards(JwtAuthGuard)
  @Post('report/create')
  @ApiOperation({ summary: 'Báo cáo lỗi story' })
  async createStoryReport() {}
}
