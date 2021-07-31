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
      return words.map((word) => {
        return this.wordsHelper.mapWordToWordInLesson(word);
      });
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
  public async isExist(): Promise<boolean> {
    const word = this.wordModel.findOne({});
    return word ? true : false;
  }
  public async updateWords(
    ids: number | string[],
    unitNId: number,
  ): Promise<void> {
    try {
      let filter = {};
      let update = {};
      if (Array.isArray(ids)) {
        filter = { _id: { $in: ids } };
        update = { unitNId: unitNId };
      } else {
        filter = { bookNId: ids, unitNId: unitNId };
        update = { unitNId: 100 * unitNId };
      }
      await this.wordModel.updateMany(filter, update);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async importWord(rows: string[][]): Promise<void> {
    for (let i = 1; i < rows.length; i++) {
      try {
        if (rows[i].length == 0) continue;

        const meanings = rows[i][6].split('|').map((val) => val.trim());
        const meaning = meanings[0];
        const isUseToMakeQuestion = rows[i][5].trim() !== '1';

        await this.wordModel.create({
          _id: rows[i][0],
          bookNId: Number(rows[i][2]),
          unitNId: Number(rows[i][3]),
          content: rows[i][4].trim(),
          meaning: meaning.trim(),
          imageRoot: rows[i][12],
          meanings: meanings,
          isUseToMakeQuestion: isUseToMakeQuestion,
          types: [],
          pronunciations: [],
          noImageWords: [],
          haveImageWords: [],
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }
  public async importExtend(rows: string[][]): Promise<void> {
    for (let i = 0; i < rows.length; i++) {
      // console.log(rows[i][5]);
      await this.wordModel.updateMany(
        { content: rows[i][1] },
        {
          pronunciations:
            rows[i][2] && rows[i][2] !== '' ? rows[i][2].split(',') : [],
          types: rows[i][3] && rows[i][3] !== '' ? rows[i][3].split(',') : [],
          noImageWords:
            rows[i][4] && rows[i][4] !== '' ? rows[i][4].split(',') : [],
          haveImageWords:
            rows[i][5] && rows[i][5] !== '' ? rows[i][5].split(',') : [],
        },
      );
    }
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
