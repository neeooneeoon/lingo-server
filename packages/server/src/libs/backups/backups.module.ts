import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Backup, BackupSchema } from '@entities/backup.entity';
import { BackupsService } from '@libs/backups/providers/backups.service';
import { SentencesModule } from '@libs/sentences';
import { BackupsController } from './controllers/backups.controller';
import { QuestionHoldersModule } from '@libs/questionHolders';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Backup.name, schema: BackupSchema }]),
    SentencesModule,
    QuestionHoldersModule,
  ],
  controllers: [BackupsController],
  providers: [BackupsService],
  exports: [BackupsService],
})
export class BackupsModule {}
