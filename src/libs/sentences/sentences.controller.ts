import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SentencesService } from './sentences.service';
import { CreateSentenceDto } from './dto/create-sentence.dto';
import { UpdateSentenceDto } from './dto/update-sentence.dto';

@ApiTags('sentences')
@Controller('api/sentences')
export class SentencesController {
  constructor(private readonly sentencesService: SentencesService) {}

}
