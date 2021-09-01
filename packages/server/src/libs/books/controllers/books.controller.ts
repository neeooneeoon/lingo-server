import { JwtAuthGuard } from '@authentication/guard/jwtAuth.guard';
import { BookGrade, GetLessonInput, GetLessonOutput } from '@dto/book';
import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserCtx } from '@utils/decorators/custom.decorator';
import { JwtPayLoad } from '@utils/types';
import { grades } from '../constants';
import { BooksService } from '../providers/books.service';
import { ProgressBookMapping } from '@dto/progress';
import { WordsService } from '@libs/words/words.service';
import { WordInLesson } from '@dto/word';

@ApiTags('Books')
@ApiBearerAuth()
@Controller('api')
export class BooksController {
  constructor(
    private booksService: BooksService,
    private wordsService: WordsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('books/grade/:grade')
  @ApiParam({
    type: Number,
    enum: grades,
    name: 'grade',
    description: 'Chọn khối từ 1 - 12',
  })
  @ApiResponse({ type: [BookGrade], status: 200 })
  @ApiOperation({ summary: 'Thông tin sách theo khối học' })
  async booksByGrade(
    @Param('grade') grade: number,
    @UserCtx() user: JwtPayLoad,
  ): Promise<BookGrade[]> {
    return this.booksService.getBooksByGrade(Number(grade), user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin các unit trong 1 cuốn sách' })
  @Get('book/:bookId/units')
  @ApiParam({
    type: String,
    name: 'bookId',
    required: true,
    description: 'Id của sách',
  })
  @ApiResponse({ type: ProgressBookMapping, status: 200 })
  async unitsInBook(
    @Param('bookId') bookId: string,
    @UserCtx() user: JwtPayLoad,
  ): Promise<ProgressBookMapping> {
    return this.booksService.getUnitsInBook(bookId, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Lấy thông tin bài học theo level trong 1 unit',
  })
  @Get('book/:bookId/:unitId/get')
  @ApiParam({
    type: String,
    name: 'bookId',
    required: true,
    description: 'Id của sách',
  })
  @ApiParam({
    type: String,
    name: 'unitId',
    required: true,
    description: 'Id của unit',
  })
  @ApiQuery({
    type: Number,
    name: 'levelIndex',
    required: true,
    description: 'Chỉ số của level (0, 1, 2,...)',
  })
  @ApiQuery({
    type: Number,
    name: 'lessonIndex',
    required: true,
    description: 'Chỉ số của lesson trong level đó (0, 1, 2,...)',
  })
  async lessonsInUnit(
    @Param('bookId') bookId: string,
    @Param('unitId') unitId: string,
    @Query('levelIndex') levelIndex: number,
    @Query('lessonIndex') lessonIndex: number,
    @UserCtx() user: JwtPayLoad,
  ): Promise<GetLessonOutput> {
    const input: GetLessonInput = {
      bookId: bookId,
      unitId: unitId,
      levelIndex: levelIndex,
      lessonIndex: lessonIndex,
    };
    return this.booksService.getDetailLesson(user.userId, input);
  }

  @UseGuards(JwtAuthGuard)
  @Get('words/in-unit/:bookNId/:unitNId')
  @ApiParam({ type: Number, name: 'bookNId', required: true })
  @ApiParam({ type: Number, name: 'unitNId', required: true })
  @ApiOperation({ summary: 'Lấy các từ theo book và unit' })
  @ApiResponse({ type: [WordInLesson], status: 200 })
  async getWordsInUnit(
    @Param('bookNId') bookNId: number,
    @Param('unitNId') unitNId: number,
  ) {
    return this.wordsService.getWordsInUnit(bookNId, unitNId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('levels')
  @ApiQuery({ name: 'bookId', required: true, type: String })
  @ApiQuery({ name: 'unitId', required: true, type: String })
  getMetaLevels(
    @Query('bookId') bookId: string,
    @Query('unitId') unitId: string,
  ) {
    return this.booksService.getLevelsInUnit(bookId, unitId);
  }
}
