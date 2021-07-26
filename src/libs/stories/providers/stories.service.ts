import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Story, StoryDocument } from '@entities/story.entity';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';

@Injectable()
export class StoriesService {
  constructor(
    @InjectModel(Story.name) private storiesModel: Model<StoryDocument>,
  ) {}

  public getStoriesInUnit(
    bookId: string,
    unitId: string,
  ): Observable<StoryDocument[]> {
    const unselectFields = [
      '-__v',
      '-unitId',
      '-bookId',
      '-sentences._id',
      '-sentences.splitSentences._id',
    ];
    return from(
      this.storiesModel
        .find({
          bookId: bookId,
          unitId: unitId,
        })
        .select(unselectFields),
    );
  }
}
