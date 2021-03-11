import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { QuestionHoldersService } from './question-holders.service';
import { CreateQuestionHolderDto } from './dto/create-question-holder.dto';
import { UpdateQuestionHolderDto } from './dto/update-question-holder.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('question-holders')
@Controller('question-holders')
export class QuestionHoldersController {
  constructor(private readonly questionHoldersService: QuestionHoldersService) {}

  @Post()
  create(@Body() createQuestionHolderDto: CreateQuestionHolderDto) {
    return this.questionHoldersService.create(createQuestionHolderDto);
  }

  @Get()
  findAll() {
    return this.questionHoldersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionHoldersService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateQuestionHolderDto: UpdateQuestionHolderDto) {
    return this.questionHoldersService.update(+id, updateQuestionHolderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionHoldersService.remove(+id);
  }
}
