import { Module } from '@nestjs/common';
import { StoriesController } from './controllers/stories.controller';
import { StoriesService } from './providers/stories.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Story, StorySchema } from '@entities/story.entity';
import {
  StoryQuestion,
  StoryQuestionSchema,
} from '@entities/storyQuestion.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema },
      { name: StoryQuestion.name, schema: StoryQuestionSchema },
    ]),
  ],
  controllers: [StoriesController],
  providers: [StoriesService],
})
export class StoriesModule {}
