import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { WordsService } from './words.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';

@ApiTags('words')
@Controller('api/words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}
  @Get('test/:bookNId/:unitNId')
  @ApiQuery({ name:'bookNId', type: Number, required: true })
  @ApiQuery({ name:'unitNId', type: Number, required: true })
  getMissed(@Query('bookNId') bookNId: number, @Query('unitNId') unitNId: number) {
    return this.wordsService.getMissedSpelling(bookNId, unitNId)
  }
}
