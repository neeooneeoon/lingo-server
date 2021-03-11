import { Module } from '@nestjs/common';
import { ProgressesService } from './progresses.service';
import { ProgressesController } from './progresses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Progress, ProgressSchema } from './schema/progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Progress.name, schema: ProgressSchema},
    ])
  ],
  controllers: [ProgressesController],
  providers: [ProgressesService],
  exports: [ProgressesService]
})
export class ProgressesModule {}
