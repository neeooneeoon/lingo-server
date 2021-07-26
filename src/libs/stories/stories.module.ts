import { Module } from '@nestjs/common';
import { StoriesController } from './controllers/stories.controller';
import { StoriesService } from './providers/stories.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Story, StorySchema } from '@entities/story.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Story.name, schema: StorySchema }]),
  ],
  controllers: [StoriesController],
  providers: [StoriesService],
})
export class StoriesModule {}
