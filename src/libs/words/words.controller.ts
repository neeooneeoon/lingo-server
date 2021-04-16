import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';
import { WordsService } from './words.service';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
@Controller('api/words')
export class WordsController {
  constructor(private readonly wordsService: WordsService) {}
}
