import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Backup, BackupDocument } from '@entities/backup.entity';
import { Model } from 'mongoose';
import { BackupDto } from '@dto/backup';
import { from, Observable } from 'rxjs';

@Injectable()
export class BackupsService {
  constructor(
    @InjectModel(Backup.name) private backupModel: Model<BackupDocument>,
  ) {}
  public restore(data: BackupDto): Observable<BackupDocument> {
    return from(
      this.backupModel.create({
        ...data,
      }),
    );
  }
  public async readNewInstances(): Promise<BackupDocument[]> {
    return this.backupModel.find({
      newInstance: true,
    });
  }
}
