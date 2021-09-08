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
import { StoryReport, StoryReportSchema } from '@entities//storyReport.entity';
import { StoryReportsService } from './providers/storyReports.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Story.name, schema: StorySchema },
      { name: StoryQuestion.name, schema: StoryQuestionSchema },
      { name: StoryReport.name, schema: StoryReportSchema },
    ]),
    WordsModule,
    ScoreStatisticsModule,
    UsersModule,
  ],
  controllers: [StoriesController, StoryReportsController],
  providers: [StoriesService, StoryReportsService],
})
export class StoriesModule {}
