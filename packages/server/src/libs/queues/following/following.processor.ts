import { FollowingsService } from '@libs/followings/providers/followings.service';
import { Process, Processor } from '@nestjs/bull';
import { BadRequestException, Logger } from '@nestjs/common';
import { TagsService } from '@libs/followings/providers/tags.service';

@Processor('following')
export class FollowingProcessor {
  private readonly logger = new Logger(FollowingProcessor.name);

  constructor(
    private readonly followingService: FollowingsService,
    private readonly tagsService: TagsService,
  ) {}

  @Process('pushTagsToCache')
  async handlePushTagsToCache() {
    try {
      this.logger.debug('Start pushTagsToCache');
      await this.tagsService.pushToCache();
      this.logger.debug('Done pushTagsToCache');
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException();
    }
  }

  @Process('pushFollowingsToCache')
  async handlePushFollowingsToCache() {
    try {
      this.logger.debug('Start pushFollowingsToCache');
      await this.followingService.pushToCache();
      this.logger.debug('End pushFollowingsToCache');
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException(error);
    }
  }
}
