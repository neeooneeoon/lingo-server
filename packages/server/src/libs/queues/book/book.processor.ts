import { BooksService } from '@libs/books/providers/books.service';
import { Process, Processor } from '@nestjs/bull';
import { Logger, BadRequestException } from '@nestjs/common';
import { StoriesService } from '@libs/stories/providers/stories.service';

@Processor('book')
export class BookProcessor {
  private readonly logger = new Logger(BookProcessor.name);

  constructor(
    private readonly booksService: BooksService,
    private readonly storyService: StoriesService,
  ) {}

  @Process('pushBooksToCache')
  async handlePushBooksToCache() {
    try {
      this.logger.debug('Start pushBooksToCache');
      await this.booksService.pushToCache();
      this.logger.debug('Done pushBooksToCache');
      return;
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException(error);
    }
  }

  @Process('pushStoriesToCache')
  async handlePushStoriesToCache() {
    try {
      this.logger.debug('Start pushStoriesToCache');
      await this.storyService.pushToCache();
      this.logger.debug('Done pushStoriesToCache');
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException(error);
    }
  }
}
