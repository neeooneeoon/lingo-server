import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { QuestionHoldersService } from './question-holders.service';
import { CreateQuestionHolderDto } from './dto/create-question-holder.dto';
import { UpdateQuestionHolderDto } from './dto/update-question-holder.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('question-holders')
@Controller('question-holders')
export class QuestionHoldersController {
  constructor(private readonly questionHoldersService: QuestionHoldersService) {}

}
