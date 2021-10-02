import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { VersionsService } from '@admin/versions/versions.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(private versionsService: VersionsService) {}

  @Cron('10 1 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async pushVersionToCache() {
    this.logger.log('Push version to cache');
    await this.versionsService.pushToCache();
  }
}
