import { Module } from '@nestjs/common';
import { StoriesController } from './controllers/stories.controller';
import { StoryReportsController } from './controllers/storyReports.controller';
import { StoriesService } from './providers/stories.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Story, StorySchema } from '@entities/story.entity';
import {
  StoryQuestion,
  StoryQuestionSchema,
} from '@entities/storyQuestion.entity';
import { WordsModule } from '@libs/words';
import { ScoreStatisticsModule } from '@libs/scoreStatistics/scoreStatistics.module';
import { UsersModule } from '@libs/users';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema },
      { name: StoryQuestion.name, schema: StoryQuestionSchema },
    ]),
    WordsModule,
    ScoreStatisticsModule,
    UsersModule,
  ],
  controllers: [StoriesController, StoryReportsController],
  providers: [StoriesService],
})
export class StoriesModule {}
