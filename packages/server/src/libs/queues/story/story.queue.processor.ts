import { Process, Processor } from '@nestjs/bull';
import { BadRequestException, Logger } from '@nestjs/common';
import { StoriesService } from '@libs/stories/providers/stories.service';

@Processor('story')
export class StoryQueueProcessor {
  private readonly logger = new Logger();

  constructor(private readonly storiesService: StoriesService) {}

  @Process('pushStories')
  async pushStories() {
    try {
      this.logger.debug('Start puhStories');
      await this.storiesService.pushToCache();
      this.logger.debug('Done pushStories');
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException(error);
    }
  }
}
