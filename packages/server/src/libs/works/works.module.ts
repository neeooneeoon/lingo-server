import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Work, WorkSchema } from '@entities/work.entity';
import { WorksService } from './works.service';
import { QuestionHoldersModule } from '@libs/questionHolders';
import { CacheModule } from '@cache';
import { ConnectModule } from '@connect';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Work.name, schema: WorkSchema }]),
    QuestionHoldersModule,
    CacheModule,
    ConnectModule,
  ],
  controllers: [],
  providers: [WorksService],
  exports: [WorksService],
})
export class WorksModule {}
