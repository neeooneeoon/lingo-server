import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ImportsService } from './imports.service';

@Controller('admin/import')
@ApiTags('Import')
// @UseGuards(JwtAuthGuard)
export class ImportsController {
  constructor(private importsService: ImportsService) {}
  @Post('import/data')
  async importData() {
    return this.importsService.importBooksData();
  }
}
