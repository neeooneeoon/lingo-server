import {
  ContentSplitDto,
  CreateSentenceDto,
  SentenceInLesson,
  TranslateSplitDto,
} from '@dto/sentence';
import { Sentence, SentenceDocument } from '@entities/sentence.entity';
import { SentencesHelper } from '@helpers/sentences.helper';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { randomUUID } from 'crypto';

@Injectable()
export class SentencesService {
  constructor(
    @InjectModel(Sentence.name) private sentenceModel: Model<SentenceDocument>,
    private sentencesHelper: SentencesHelper,
  ) {}

  public async findByIds(ids: string[]): Promise<SentenceInLesson[]> {
    try {
      const sentences = await this.sentenceModel.find({
        _id: {
          $in: ids,
        },
      });
      const result = sentences.map((sentence) => {
        return this.sentencesHelper.mapSentenceToSentenceInLesson(sentence);
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getSentence(id: string): Promise<SentenceDocument> {
    try {
      const sentence = await this.sentenceModel.findById(id);
      if (!sentence) {
        throw new BadRequestException(`Can't find sentence with id ${id}`);
      }
      return sentence;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public getSentencesINPreviousBooks(currentBookNId: number) {
    return from(
      this.sentenceModel.find(
        {
          bookNId: {
            $lte: currentBookNId,
          },
        },
        {
          content: 1,
          translate: 1,
          audio: 1,
          _id: 1,
        },
      ),
    );
  }
  public searchSentences(content: string): Observable<SentenceDocument[]> {
    const unSelect = [
      '-__v',
      '-tempTranslates',
      '-replaceWords',
      '-contentSplit',
      '-translateSplit',
    ];
    return from(
      this.sentenceModel
        .find({
          content: {
            $regex: '.*' + content + '.*',
          },
        })
        .select(unSelect),
    );
  }
  public async addNewSentence(
    input: CreateSentenceDto,
  ): Promise<SentenceDocument> {
    const { content, meaning, audio } = input;
    const trimMeaning = meaning.trim().normalize('NFKD');
    const trimContent = content.trim().normalize('NFKD');
    const uuid = randomUUID();
    return this.sentenceModel.create({
      isConversation: false,
      _id: uuid,
      bookNId: -1,
      unitNId: -1,
      position: 0,
      baseId: uuid,
      content: trimContent,
      tempTranslates: [],
      wordBaseIndex: -1,
      translate: [],
      audio: audio ? audio : '',
      contentSplit: [],
      translateSplit: [],
      translates: trimMeaning,
      replaceWords: [],
    });
  }
}
