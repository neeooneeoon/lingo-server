import { ConfigsModule } from '@configs/configs.module';
import { BooksModule } from '@libs/books';
import { ProgressesModule } from '@libs/progresses';
import { WorksModule } from '@libs/works';
import { Module } from '@nestjs/common';
import { GoogleModule } from '../google/google.module';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';

@Module({
  imports: [
    GoogleModule,
    ConfigsModule,
    WorksModule,
    BooksModule,
    ProgressesModule,
  ],
  providers: [ImportsService],
  controllers: [ImportsController],
  exports: [ImportsService],
})
export class ImportsModule {}
