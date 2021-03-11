import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBearerAuth, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { JwtAuthGuard } from 'src/authentication/jwt-auth.guard';
import { BookByGradeResponse } from './dto/book-by-grade.dto';
import { UserCtx } from 'src/common/custom.decorator';
import { UserContext } from 'src/common/type';
import { Types } from 'mongoose';

@ApiTags('books')
@Controller('api/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  @ApiBearerAuth()
  @ApiConsumes('application/json')
  findAll() {
    return this.booksService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth()
  @ApiConsumes('application/json')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/grade/:grade')
  @ApiBearerAuth()
  @ApiConsumes('application/json')
  @ApiParam({ enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], name: "grade", description: "Choose grade from 1 to 12" })
  @ApiResponse({ type: BookByGradeResponse })
  getByGrade(@Param('grade') grade: number, @UserCtx('user')user: UserContext) {
    return this.booksService.getBooksByGrade(grade, Types.ObjectId(user.userId));
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id/units')
  @ApiBearerAuth()
  @ApiConsumes('application/json')
  getUnitsByBookId(@Param('id') id: string, @UserCtx('user')user: UserContext) {
    return this.booksService.getUnitsByBookId(user.userId, id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(+id, updateBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.booksService.remove(+id);
  }
}
