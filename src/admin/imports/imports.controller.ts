import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ImportsService } from './imports.service';

@Controller('admin/import')
@ApiTags('Import')
// @UseGuards(JwtAuthGuard)
export class ImportsController {
<<<<<<< HEAD
    constructor(
        private importsService: ImportsService
    ) {}
    @Post('import/data')
    async importData() {
        return this.importsService.importBooksData()
    }
}
=======
  constructor(private importsService: ImportsService) {}
  @Post('import/data')
  async importData() {
    // return this.importsService.importData()
  }
}
>>>>>>> 7b264252a805eba2eebd43458261bc2be6f12fdb
