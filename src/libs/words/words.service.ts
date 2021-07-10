import { map } from 'rxjs/operators';
import { WordInLesson } from '@dto/word/wordInLesson.dto';
import { Word, WordDocument } from '@entities/word.entity';
import { WordsHelper } from '@helpers/words.helper';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';

@Injectable()
export class WordsService {
  constructor(
    @InjectModel(Word.name) private wordModel: Model<WordDocument>,
    private wordsHelper: WordsHelper,
  ) {}

  async findByIds(ids: string[]): Promise<WordInLesson[]> {
    try {
      const words = await this.wordModel.find({
        _id: {
          $in: ids,
        },
      });
      const result = words.map((word) => {
        return this.wordsHelper.mapWordToWordInLesson(word);
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getWord(id: string): Promise<WordDocument> {
    try {
      const word = await this.wordModel.findById(id);
      if (!word) {
        throw new BadRequestException(`Can't find word ${id}`);
      }
      return word;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async getWordsInUnit(
    bookNId: number,
    unitNId: number,
  ): Promise<WordInLesson[]> {
    try {
      const words = await this.wordModel.find({
        bookNId: bookNId,
        unitNId: unitNId,
      });
      const result = words.map((word) =>
        this.wordsHelper.mapWordToWordInLesson(word),
      );
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public getWordsInPreviousBooks(currentBookNId: number) {
    return from(
      this.wordModel.find(
        {
          bookNId: {
            $lte: currentBookNId,
          },
        },
        {
          content: 1,
          meaning: 1,
          _id: 1,
        },
      ),
    );
  }

  public searchExactWord(search: string): Observable<WordDocument> {
    return from(
      this.wordModel.find({
        content: search,
      }),
    ).pipe(
      map((words: WordDocument[]) => {
        if (!words || words.length === 0) {
          throw new NotFoundException(`Not found ${search}`);
        }
        let result = words[0];
        for (let i = 0; i < words.length; i++) {
          if (words[i].imageRoot !== '' && words[i].imageRoot) {
            result = words[i];
            break;
          }
        }
        return result;
      }),
    );
  }
}
