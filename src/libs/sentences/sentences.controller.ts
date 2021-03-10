import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SentencesService } from './sentences.service';
import { CreateSentenceDto } from './dto/create-sentence.dto';
import { UpdateSentenceDto } from './dto/update-sentence.dto';

@ApiTags('sentences')
@Controller('api/sentences')
export class SentencesController {
  constructor(private readonly sentencesService: SentencesService) {}

  @Post()
  create(@Body() createSentenceDto: CreateSentenceDto) {
    return this.sentencesService.create(createSentenceDto);
  }

  @Get()
  findAll() {
    return this.sentencesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sentencesService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSentenceDto: UpdateSentenceDto) {
    return this.sentencesService.update(+id, updateSentenceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sentencesService.remove(+id);
  }
}
