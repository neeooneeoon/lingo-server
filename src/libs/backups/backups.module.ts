import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Backup, BackupSchema } from '@entities/backup.entity';
import { BackupsService } from '@libs/backups/providers/backups.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Backup.name, schema: BackupSchema }]),
  ],
  providers: [BackupsService],
  exports: [BackupsService],
})
export class BackupsModule {}
