import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Story, StoryDocument } from '@entities/story.entity';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { StoryQuestionDocument } from '@entities/storyQuestion.entity';
import { QuestionTypeCode } from '@utils/enums';
import { WordsService } from '@libs/words/words.service';
import { ScoreStatisticsService } from '@libs/scoreStatistics/scoreStatistics.service';
import { UserScoresService } from '@libs/users/providers/userScores.service';
import { StoryResult } from '@dto/stories';

@Injectable()
export class StoriesService {
  constructor(
    @InjectModel(Story.name) private storiesModel: Model<StoryDocument>,
    private readonly wordsService: WordsService,
    private readonly scoreStatisticsService: ScoreStatisticsService,
    private readonly userScoresService: UserScoresService,
  ) {}

  public getStoriesInUnit(
    bookId: string,
    unitId: string,
  ): Observable<StoryDocument[]> {
    const unselectFields = ['-__v', '-sentences'];
    return from(
      this.storiesModel
        .find({
          bookId: bookId,
          unitId: unitId,
        })
        .select(unselectFields),
    );
  }

  public async getStoryQuestions(storyId: number) {
    const story = await this.storiesModel
      .findById(storyId)
      .populate('sentences.questions')
      .select(['-__v']);
    if (story?.sentences?.length > 0) {
      const wordSet: Set<string> = new Set<string>();
      for (const sentence of story.sentences) {
        const questions =
          sentence.questions as unknown as StoryQuestionDocument[];
        if (questions.length > 0) {
          for (const question of questions) {
            question.focus && wordSet.add(question.focus);
            const choices = question.choices;
            delete question.choices;
            if (
              [QuestionTypeCode.W15, QuestionTypeCode.W13].includes(
                question.code,
              ) &&
              choices.length > 0
            ) {
              for (const choice of choices) {
                choice.active && wordSet.add(choice._id);
              }
            }
          }
        }
      }
      const words = await this.wordsService.findByIds([...wordSet]);
      return {
        story,
        words,
      };
    }
    return {
      story,
      words: [],
    };
  }

  public async checkStoryResult(
    input: StoryResult & { storyId: number; userId: string },
  ) {
    if (input?.results?.length > 0) {
      const story = await this.storiesModel.findById(input.storyId);
      if (!story) throw new BadRequestException('Story not found');
      if (story?.sentences?.length > 0) {
        const setIds: Set<string> = new Set(
          input.results.map((result) => result.sentenceId),
        );
        let totalScore = 0;
        [...setIds].map((id) => {
          const index = story.sentences.findIndex(
            (item) => String(item._id) === id && item.questions.length > 0,
          );
          if (index !== -1) totalScore += 1;
        });
        if (totalScore > 0)
          await Promise.all([
            this.scoreStatisticsService.addXpAfterSaveLesson(
              totalScore,
              input.userId,
            ),
            this.userScoresService.bonusStoryScores(input.userId, totalScore),
          ]);
      }
    }
  }
}
