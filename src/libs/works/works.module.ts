import { Module } from '@nestjs/common';
import { WorksService } from './works.service';
import { WorksController } from './works.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Work, WorkSchema } from './schema/work.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Work.name, schema: WorkSchema }
    ])
  ],
  controllers: [WorksController],
  providers: [WorksService],
  exports: [WorksService]
})
export class WorksModule {}
