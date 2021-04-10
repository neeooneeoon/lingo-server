import { Module } from '@nestjs/common';
import { ProgressesService } from './progresses.service';
import { ProgressesController } from './progresses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Progress, ProgressSchema } from './schema/progress.schema';
import { ResultMappingHelper } from 'src/helper/resultMapping.helper';
@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Progress.name, schema: ProgressSchema},
    ])
  ],
  controllers: [ProgressesController],
  providers: [ProgressesService, ResultMappingHelper],
  exports: [ProgressesService]
})
export class ProgressesModule {}
