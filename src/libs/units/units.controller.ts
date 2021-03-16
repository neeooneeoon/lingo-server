import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@ApiTags('units')
@Controller('api/units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}
}
