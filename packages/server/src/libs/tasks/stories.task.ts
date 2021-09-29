import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StoriesService } from '@libs/stories/providers/stories.service';
import { ConfigsService } from '@configs';
import { Cache } from 'cache-manager';
import { GroupStories } from '@dto/stories';

@Injectable()
export class StoriesTask {
  private prefixKey: string;
  private logger = new Logger(StoriesTask.name);

  constructor(
    private readonly storyService: StoriesService,
    private readonly configsService: ConfigsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.prefixKey = this.configsService.get('MODE');
  }

  @Cron('0 2 * * *')
  async pushToCache() {
    const groups = await this.storyService.groupStories();
    await Promise.all(
      groups.map((group) => {
        const path = `${this.prefixKey}/${group.bookId}/${group.unitId}/stories`;
        return this.cacheManager.set<GroupStories>(path, group, { ttl: 86400 });
      }),
    );
    this.logger.log('Cache stories is done');
  }
}
