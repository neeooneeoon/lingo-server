import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ProgressesService } from './progresses.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('progresses')
@Controller('progresses')
export class ProgressesController {
  constructor(private readonly progressesService: ProgressesService) {}
}
