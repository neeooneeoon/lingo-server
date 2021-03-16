import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req } from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBearerAuth, ApiParam, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from 'src/authentication/jwt-auth.guard';
import { BookByGradeResponse } from './dto/book-by-grade.dto';
import { UserCtx } from 'src/common/custom.decorator';
import { UserContext } from 'src/helper/type';
import { Types } from 'mongoose';
import { Request } from 'express';

@ApiTags('books')
@ApiBearerAuth()
@Controller('api/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiConsumes('application/json')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/grade/:grade')
  @ApiConsumes('application/json')
  @ApiParam({ enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], name: "grade", description: "Choose grade from 1 to 12" })
  @ApiResponse({ type: BookByGradeResponse })
  getByGrade(@Param('grade') grade: number, @UserCtx('user')user: UserContext) {
    return this.booksService.getBooksByGrade(grade, Types.ObjectId(user.userId));
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/units')
  @ApiConsumes('application/json')
  getUnitsByBookId(@Param('id') id: string, @UserCtx('user')user: UserContext) {
    return this.booksService.getUnitsByBookId(user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:bookId/:unitId/get')
  @ApiConsumes('application/json')
  @ApiQuery({ name: "level", type: Number, required: true, description: "Level Index" })
  @ApiQuery({ name: "lesson", type: Number, required: true, description: "Lesson Index" })
  getUnitLessons(
    @Param('bookId') bookId: string,
    @Param('unitId') unitId: string,
    @UserCtx('user')user: UserContext,
    @Query('level') level: number, @Query('lesson') lesson: number
    ) {
      return this.booksService.getLessonsByUnit(user.userId, { bookId: bookId, unitId: unitId, lessonIndex: lesson, levelIndex: level })
  }
}
