import { Module } from '@nestjs/common';
import { StoriesController } from './controllers/stories.controller';
import { StoriesService } from './providers/stories.service';

@Module({
  imports: [],
  controllers: [StoriesController],
  providers: [StoriesService],
})
export class StoriesModule {}
