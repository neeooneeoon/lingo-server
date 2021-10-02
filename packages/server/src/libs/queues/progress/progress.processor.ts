import { ProgressesService } from '@libs/progresses/progresses.service';
import { Process, Processor } from '@nestjs/bull';
import { Logger, BadRequestException } from '@nestjs/common';

@Processor('progress')
export class ProgressProcessor {
  private readonly logger = new Logger(ProgressProcessor.name);

  constructor(private readonly progressService: ProgressesService) {}

  @Process('pushProgressBooksToCache')
  async handlePushProgressBooksToCache() {
    try {
      this.logger.debug('Start pushProgressBooksToCache');
      await this.progressService.pushToCache();
      this.logger.debug('Done pushProgressBooksToCache');
      return;
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException(error);
    }
  }
}
