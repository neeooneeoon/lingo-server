import {
  BadRequestException,
  CACHE_MANAGER,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookDocument } from '@entities/book.entity';
import { LeanDocument, Model } from 'mongoose';
import { ProgressesService } from '@libs/progresses/progresses.service';
import {
  BookGrade,
  GetLessonInput,
  GetLessonOutput,
  LessonTree,
} from '@dto/book';
import { BooksHelper } from '@helpers/books.helper';
import { WorksService } from '@libs/works/works.service';
import {
  ActiveBookProgress,
  ProgressBook,
  ProgressBookMapping,
} from '@dto/progress';
import { QuestionHoldersService } from '@libs/questionHolders/providers/questionHolders.service';
import { LessonDocument } from '@entities/lesson.entity';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { booksName } from '@utils/constants';
import { Unit } from '@dto/unit/unit.dto';
import { SentenceDocument } from '@entities/sentence.entity';
import { WordsService } from '@libs/words/words.service';
import { SentencesService } from '@libs/sentences/sentences.service';
import { WordInLesson } from '@dto/word';
import { Cache } from 'cache-manager';
import { QuestionDocument } from '@entities/question.entity';
import { ConfigsService } from '@configs';
import { OverLevelDto } from '@dto/book';
import { TransactionService } from '@connect';

@Injectable()
export class BooksService {
  private prefixKey: string;
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    @Inject(forwardRef(() => ProgressesService))
    private progressesService: ProgressesService,
    private worksService: WorksService,
    private wordsService: WordsService,
    private sentencesService: SentencesService,
    private booksHelper: BooksHelper,
    private questionHoldersService: QuestionHoldersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configsService: ConfigsService,
    private readonly transactionService: TransactionService,
  ) {
    this.prefixKey = this.configsService.get('MODE');
  }

  public findBookWithProgressBook(
    book: Partial<ProgressBook>,
  ): Observable<ActiveBookProgress> {
    const unSelect = ['name', 'grade', 'cover', '-_id', 'units._id'];
    return from(
      this.bookModel.findById(book.bookId).select(unSelect).lean(),
    ).pipe(
      map((result) => {
        return {
          name: result?.name,
          grade: result?.grade,
          cover: result?.cover,
          bookId: book.bookId,
          doneLessons: book.doneLessons,
          totalLessons: book.totalLessons,
          lastDid: book.lastDid,
          units: book.units,
        };
      }),
    );
  }

  public async getBook(bookId: string): Promise<BookDocument> {
    return this.bookModel.findById(bookId);
  }

  public async booksFromCache(
    grade: number,
  ): Promise<LeanDocument<BookDocument>[]> {
    let books = await this.cacheManager.get<LeanDocument<BookDocument>[]>(
      `${this.prefixKey}/books/${grade}`,
    );
    if (!books) {
      const selectedFields = [
        '_id',
        'nId',
        'name',
        'grade',
        'cover',
        'totalWords',
        'description',
        'totalQuestions',
        'totalLessons',
        'units._id',
      ];
      books = await this.bookModel
        .find({ grade: grade })
        .select(selectedFields)
        .sort({ nId: 1 })
        .lean();
      if (books?.length > 0) {
        await this.cacheManager.set<LeanDocument<BookDocument>[]>(
          `${this.prefixKey}/books/${grade}`,
          books,
          { ttl: 86400 },
        );
        return books;
      } else {
        console.log('No books');
        throw new BadRequestException(`Not books in grade ${grade}.`);
      }
    } else {
      return books;
    }
  }

  public async getBooksByGrade(
    grade: number,
    userId: string,
  ): Promise<BookGrade[]> {
    try {
      // const session = await this.transactionService.createSession();
      // session.startTransaction();
      // eslint-disable-next-line prefer-const
      let [books, booksProgress] = await Promise.all([
        this.booksFromCache(grade),
        this.progressesService.booksProgress(userId),
      ]);
      // await session.commitTransaction();
      // session.endSession();
      return books.map((book) => {
        const progressBook = booksProgress?.find(
          (item) => item.bookId === book._id,
        );
        return this.booksHelper.mapToBookGrade(book, progressBook);
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  public async getUnitsInBook(
    bookId: string,
    userId: string,
  ): Promise<ProgressBookMapping> {
    try {
      // const session = await this.transactionService.createSession();
      // session.startTransaction();
      const [book, instanceUserWork] = await Promise.all([
        this.getBook(bookId),
        this.worksService.findUserWork(userId, bookId),
      ]);
      if (!book) {
        throw new BadRequestException('Book not found');
      }
      if (!instanceUserWork) {
        await this.worksService.createUserWork(userId, bookId);
      }
      // await session.commitTransaction();
      // session.endSession();
      return this.progressesService.getBookProgress(userId, book);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getDetailLesson(
    userId: string,
    input: GetLessonInput,
  ): Promise<GetLessonOutput> {
    const { bookId, unitId, levelIndex, lessonIndex } = input;
    const book = await this.getBook(bookId);
    const units = book.units;
    if (!units || units.length == 0) {
      throw new BadRequestException(`No unit in book ${bookId}`);
    }
    const unit = units.find((item) => item._id == unitId);
    if (!unit) {
      throw new BadRequestException(`No unit ${unit} in book ${bookId}`);
    }
    const levels = unit.levels;
    if (!levels || levels.length == 0) {
      throw new BadRequestException(`No level in unit ${unitId}`);
    }
    const level = levels.find((item) => item.levelIndex === levelIndex);
    if (!level) {
      throw new BadRequestException(`No level ${levelIndex} in unit ${unitId}`);
    }
    const lessons = level.lessons;
    if (!lessons || lessons.length == 0) {
      throw new BadRequestException(`No lessons in level index ${levelIndex}`);
    }
    let lesson: LessonDocument;
    if (levelIndex == levels.length - 1 && lessonIndex == lessons.length) {
      lesson = lessons[lessons.length - 1];
    } else {
      lesson = lessons.find((item) => item.lessonIndex === lessonIndex);
    }
    if (!lesson) {
      throw new BadRequestException(`Can't find lesson ${lessonIndex}`);
    }
    let questions = await this.cacheManager.get<
      LeanDocument<QuestionDocument>[] | null
    >(`${this.prefixKey}/questionHolder/${bookId}/${unitId}/${levelIndex}`);
    if (!questions || questions?.length === 0) {
      const questionHolder =
        await this.questionHoldersService.getQuestionHolder({
          bookId: bookId,
          unitId: unitId,
          level: levelIndex,
        });
      questions = questionHolder?.questions;
      if (questions?.length > 0) {
        await this.cacheManager.set<LeanDocument<QuestionDocument>[]>(
          `${this.prefixKey}/questionHolder/${bookId}/${unitId}/${levelIndex}`,
          questions,
          { ttl: 7200 },
        );
      }
    }

    if (lesson?.questionIds?.length == 0 && questions?.length > 0) {
      const userWork = await this.worksService.getUserWork(userId, bookId);
      const userWorkUnit = userWork?.units?.find(
        (item) => item.unitId === unitId,
      );
      const userWorkLevel = userWorkUnit?.levels?.find(
        (item) => item.levelIndex === levelIndex,
      );
      if (lessonIndex === lessons.length - 1) {
        const incorrectList = userWorkLevel ? userWorkLevel.incorrectList : [];
        const incorrectListLength = incorrectList.length;
        const questionsLength = questions.length;
        const incorrectPercent =
          Math.floor(incorrectListLength / questionsLength) * 100;
        const maxSize = book.grade <= 2 ? 5 : 10;
        const setReviewQuestions =
          this.questionHoldersService.questionsLatestLesson(
            incorrectPercent,
            questions,
            maxSize,
          );
        if (setReviewQuestions.size < maxSize) {
          const cloned = Array.from(questions);
          while (
            setReviewQuestions.size < maxSize &&
            cloned.length > maxSize &&
            cloned.length > 0
          ) {
            const index = Math.floor(Math.random() * cloned.length);
            // setReviewQuestions.add(String(questions[index]._id));
            if (!setReviewQuestions.has(String(cloned[index]._id))) {
              setReviewQuestions.add(String(cloned[index]._id));
              cloned.splice(index, 1);
            } else {
              cloned.splice(index, 1);
            }
          }
        }
        lesson.questionIds = Array.from(setReviewQuestions);
      }
    }
    const reducingOutput =
      await this.questionHoldersService.reduceByQuestionIds({
        currentUnit: unit,
        questions: questions,
        listAskingQuestionIds: lesson.questionIds,
        grade: book.grade,
      });

    return {
      lesson: { ...lesson.toJSON(), questions: reducingOutput.listQuestions },
      words: reducingOutput.wordsInLesson,
      sentences: reducingOutput.sentencesInLesson,
    };
  }

  public async getQuestionsOverLevel(input: OverLevelDto) {
    const { bookId, unitId, levelIndex } = input;
    let questions = await this.cacheManager.get<
      LeanDocument<QuestionDocument>[] | null
    >(`${this.prefixKey}/questionHolder/${bookId}/${unitId}/${levelIndex}`);
    const book = await this.getBook(bookId);
    if (!book) {
      throw new BadRequestException('Book not found');
    }
    if (!questions || questions?.length === 0) {
      const questionHolder =
        await this.questionHoldersService.getQuestionHolder({
          bookId: bookId,
          unitId: unitId,
          level: levelIndex,
        });
      questions = questionHolder?.questions;
      if (questions?.length > 0) {
        await this.cacheManager.set<LeanDocument<QuestionDocument>[]>(
          `${this.prefixKey}/questionHolder/${bookId}/${unitId}/${levelIndex}`,
          questions,
          { ttl: 7200 },
        );
      }
    }
    if (questions?.length > 0 && book) {
      const currentUnit = book?.units?.find(
        (element) => element._id === unitId,
      );
      if (!currentUnit) {
        throw new BadRequestException('Unit not found');
      }
      const group = (() => {
        const MINIMUM = 0.8;
        const levelOneQuestions: Array<LeanDocument<QuestionDocument>> = [];
        const levelTwoQuestions: Array<LeanDocument<QuestionDocument>> = [];
        const levelThreeQuestions: Array<LeanDocument<QuestionDocument>> = [];
        const levelFourQuestions: Array<LeanDocument<QuestionDocument>> = [];
        questions.forEach((element) => {
          switch (element.rank) {
            case 1:
              levelOneQuestions.push(element);
              break;
            case 2:
              levelTwoQuestions.push(element);
              break;
            case 3:
              levelThreeQuestions.push(element);
              break;
            case 4:
              levelFourQuestions.push(element);
              break;
            default:
              break;
          }
        });
        function shuffle(array: Array<LeanDocument<QuestionDocument>>) {
          if (array.length > 1) {
            const currentIndex = array.length;
            // while (currentIndex != 0) {
            //   const randomIndex = Math.floor(Math.random() * currentIndex);
            //   currentIndex--;
            //   [array[currentIndex], array[randomIndex]] = [
            //     array[randomIndex],
            //     array[currentIndex],
            //   ];
            // }
          }
          return array;
        }
        return {
          levelOneQuestions: shuffle(levelOneQuestions).slice(
            0,
            Math.round(MINIMUM * levelOneQuestions.length),
          ),
          levelTwoQuestions: shuffle(levelTwoQuestions).slice(
            0,
            Math.round(MINIMUM * levelTwoQuestions.length),
          ),
          levelThreeQuestions: shuffle(levelThreeQuestions).slice(
            0,
            Math.round(MINIMUM * levelThreeQuestions.length),
          ),
          levelFourQuestions: shuffle(levelFourQuestions).slice(
            0,
            Math.round(MINIMUM * levelFourQuestions.length),
          ),
        };
      })();
      if (group) {
        const questions: Array<QuestionDocument> = [];
        for (const key in group) {
          if (Object(group).hasOwnProperty(key)) {
            questions.push(...group[key]);
          }
        }
        const questionIds = questions.map((element) => element._id);
        const reducingOutput =
          await this.questionHoldersService.reduceByQuestionIds({
            currentUnit: currentUnit,
            questions: questions,
            listAskingQuestionIds: questionIds,
            grade: book.grade,
          });
        return {
          lesson: {
            _id: `overlevel-${book.id}-${currentUnit._id}-${levelIndex}`,
            lessonIndex: -1,
            totalQuestions: questionIds.length,
            questionIds: questionIds,
            questions: reducingOutput.listQuestions,
          },
          words: reducingOutput.wordsInLesson,
          sentences: reducingOutput.sentencesInLesson,
        };
      }
    }
  }

  public async getLessonTree(input: GetLessonInput): Promise<LessonTree> {
    const { bookId, unitId, levelIndex, lessonIndex, isOverLevel } = input;
    let isLastLesson = false;

    const book = await this.getBook(bookId);
    const units = book.units;
    if (!units || units.length === 0) {
      throw new BadRequestException(`No unit in book ${bookId}`);
    }
    const unit = units.find((item) => item._id === unitId);
    if (!unit) {
      throw new BadRequestException(`Can't find unit ${unitId}`);
    }
    const levels = unit.levels;
    if (!levels || levels.length === 0) {
      throw new BadRequestException(`No level in unit ${unitId}`);
    }
    const level = levels.find((item) => item.levelIndex === levelIndex);
    if (!level) {
      throw new BadRequestException(`Can't find level ${levelIndex}`);
    }
    if (!isOverLevel) {
      const lessons = level.lessons;
      if (!lessons || lessons.length === 0) {
        throw new BadRequestException(`No lesson in ${levelIndex}`);
      }
      let lesson: LessonDocument;
      if (
        levelIndex == unit.levels.length - 1 &&
        lessonIndex == lessons.length
      ) {
        isLastLesson = true;
        lesson = lessons[lessons.length - 1];
      } else {
        lesson = lessons.find((item) => item.lessonIndex === lessonIndex);
      }
      if (!lesson) {
        throw new BadRequestException(`Can't find lesson ${lessonIndex}`);
      }
      return {
        isLastLesson: isLastLesson,
        grade: book.grade,
        bookId: book._id,
        unitId: unit._id,
        levelIndex: levelIndex,
        lessonIndex: lessonIndex,
        unitTotalLevels: unit.levels.length,
        levelTotalLessons: level.lessons.length,
        lessonTotalQuestions: lesson.totalQuestions,
        book: book,
      };
    } else {
      return {
        isLastLesson: isLastLesson,
        grade: book.grade,
        bookId: book._id,
        unitId: unit._id,
        levelIndex: levelIndex,
        lessonIndex: -1,
        unitTotalLevels: unit.levels.length,
        levelTotalLessons: level.lessons.length,
        lessonTotalQuestions: 0,
        book: book,
      };
    }
  }

  public async finByIds(ids: Array<string>) {
    return this.bookModel
      .find({
        _id: { $in: ids },
      })
      .lean();
  }

  public async importBook(rows: string[][]): Promise<void> {
    for (let i = 1; i < rows.length; i++) {
      if (!booksName.includes(rows[i][5])) continue;
      try {
        await this.bookModel.create({
          _id: this.booksHelper.getID(rows[i][5]),
          nId: Number(rows[i][1]),
          key: rows[i][0],
          cover: rows[i][2],
          description: rows[i][3],
          grade: Number(rows[i][4]),
          name: rows[i][5],
          number: Number(rows[i][9]),
          imgName: rows[i][6],
          totalLessons: 0,
          totalQuestions: 0,
          totalSentences: 0,
          totalWords: 0,
          units: [],
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  public async isExist(): Promise<boolean> {
    const book = await this.bookModel.findOne({});
    return !!book;
  }
  public async updateBook(nId: number, unit: Unit | Unit[]): Promise<void> {
    try {
      let update = {};
      const filter = { nId: nId };
      update = {
        $inc: { totalUnits: 1 },
        $push: { units: unit },
      };
      if (Array.isArray(unit)) {
        update = {
          $inc: { totalUnits: unit.length },
          $push: { units: { $each: unit } },
        };
      }
      await this.bookModel.updateOne(filter, update);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async mapRangeToWords(
    words: WordInLesson[],
    sentences: SentenceDocument[],
    ranges: Array<number>,
    minSize: number,
    info: string[],
    prefix: number,
    unitImages: any,
    bookName: string,
  ): Promise<Unit[]> {
    const prefixNormal = `https://s.saokhuee.com/lingo/anhunit/${bookName}/normal/`;
    const prefixBlue = `https://s.saokhuee.com/lingo/anhunit/${bookName}/blue/`;
    const remainder = words.length % minSize;
    const unitNId = Number(info[1]);
    const _id = this.booksHelper.getID(info[4]);
    const unitIndex = Number(info[7]);
    const listUnits: Array<Unit> = [];
    const totalUnits = Math.floor(words.length / minSize);
    for (let index = 0; index < ranges.length; index++) {
      const range = ranges[index];
      let start: number;
      let end: number;
      if (range !== minSize) {
        start = index * range;
        end = (index + 1) * range;
      } else {
        start = index * range + remainder;
        end = (index + 1) * range + remainder;
      }
      const wordIds = words.slice(start, end).map((w) => w._id);
      const sentenceIds = sentences
        .filter((s) => wordIds.includes(s.baseId))
        .map((s) => s._id);
      // const changedUnitNId = unitNId * 100 + index;
      const unit: Unit = {
        _id: `${_id}${index + 1}`,
        nId: unitNId * 100 + index,
        unitIndex: unitIndex * 100 + index,
        key: `${info[0]}${index}`,
        name: `U${prefix}. ${info[4]} (${index + 1}/${totalUnits})`,
        description: info[3],
        grammar: info[5],
        tips: info[6],
        wordIds: wordIds,
        sentenceIds: sentenceIds,
        normalImage:
          unitImages && unitImages?.normal
            ? prefixNormal + unitImages.normal
            : '',
        blueImage:
          unitImages && unitImages?.blue ? prefixBlue + unitImages.blue : '',
        totalLessons: 0,
        totalLevels: 0,
        levels: [],
        totalQuestions: 0,
      };
      listUnits.push(unit);
      await Promise.all([
        this.wordsService.updateWords(wordIds, unit.nId),
        this.sentencesService.updateSentences(sentenceIds, unit.nId),
      ]);
    }
    return listUnits;
  }

  public async getLevelsInUnit(bookId: string, unitId: string) {
    const book = await this.bookModel.findById(bookId).select(['units']).lean();
    const units = book?.units;
    if (units?.length > 0) {
      const currentUnit = units.find((element) => element._id === unitId);
      if (currentUnit) {
        return currentUnit.levels.map((element) => {
          return {
            levelIndex: element.levelIndex,
            totalLessons: element.totalLessons,
          };
        });
      } else {
        throw new BadRequestException('Unit not found');
      }
    } else {
      throw new BadRequestException('No unit in book');
    }
  }

  private async pushBooksToCache(grade: number) {
    const books = await this.booksFromCache(grade);
    if (books) {
      await this.cacheManager.set<LeanDocument<BookDocument>[]>(
        `${this.prefixKey}/books/${grade}`,
        books,
        { ttl: 86400 },
      );
    }
  }

  public async pushToCache() {
    const grades = Array(12)
      .fill(0)
      .map((_, i) => i + 1);
    await Promise.all(
      grades.map((grade) => {
        return this.pushBooksToCache(grade);
      }),
    );
    return;
  }
}
