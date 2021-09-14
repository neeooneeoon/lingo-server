import { LeanDocument, Model, Types, UpdateWriteOpResult } from 'mongoose';
import { Progress, ProgressDocument } from '@entities/progress.entity';
import {
  BadRequestException,
  CACHE_MANAGER,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserProgressDto } from '@dto/progress/createProgress.dto';
import { BookDocument } from '@entities/book.entity';
import {
  ActiveBookProgress,
  ProgressBook,
  ProgressBookMapping,
  ProgressLevel,
  ProgressUnit,
  ProgressUnitMapping,
  ScoreOverviewDto,
} from '@dto/progress';
import { ProgressesHelper } from '@helpers/progresses.helper';
import { LessonTree } from '@dto/book';
import { WorkInfo } from '@dto/works';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BooksService } from '@libs/books/providers/books.service';
import { TransactionService } from '@connect';
import { BookProgressMetaData } from '@utils/types';
import { Cache } from 'cache-manager';
import { ConfigsService } from '@configs';

@Injectable()
export class ProgressesService {
  private readonly prefixKey: string;
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    private progressesHelper: ProgressesHelper,
    @Inject(forwardRef(() => BooksService)) private booksService: BooksService,
    private transactionService: TransactionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configsService: ConfigsService,
  ) {
    this.prefixKey = this.configsService.get('MODE');
  }

  async createUserProgress(
    input: CreateUserProgressDto,
  ): Promise<ProgressDocument> {
    const newUserProgress = await this.progressModel.create({
      userId: Types.ObjectId(String(input.userId)),
      books: input.books,
    });
    if (!newUserProgress) {
      throw new InternalServerErrorException('Can not create user progress');
    }
    return newUserProgress;
  }

  async getUserProgress(userId: string): Promise<ProgressDocument> {
    return this.progressModel.findOne({ userId: Types.ObjectId(userId) });
  }

  async booksProgress(userId: string): Promise<BookProgressMetaData[]> {
    let progressBooks = await this.cacheManager.get<BookProgressMetaData[]>(
      `${this.prefixKey}/${userId}/progressBooks`,
    );
    if (!progressBooks) {
      const selectFields = [
        'books.doneLessons',
        'books.doneQuestions',
        'books.bookId',
      ];
      let progress = await this.progressModel
        .findOne({ userId: Types.ObjectId(userId) })
        .select(selectFields)
        .lean();
      if (!progress) {
        progress = await this.createUserProgress({
          userId: userId,
          books: [],
        });
      }
      progressBooks = progress?.books?.map((element) => {
        return {
          bookId: element.bookId,
          doneLessons: element?.doneLessons ? element?.doneLessons : 0,
          doneQuestions: element?.doneQuestions ? element?.doneQuestions : 0,
        };
      });
      await this.cacheManager.set<BookProgressMetaData[]>(
        `${this.prefixKey}/${userId}/progressBooks`,
        progressBooks,
        { ttl: 86400 },
      );
      return progressBooks;
    } else {
      return progressBooks;
    }
  }

  async getBookProgress(
    userId: string,
    book: BookDocument,
  ): Promise<ProgressBookMapping> {
    let userProgress = await this.getUserProgress(userId);
    if (!userProgress) {
      userProgress = await this.createUserProgress({
        userId: userId,
        books: [],
      });
    }
    let bookProgress = userProgress.books.find(
      (item) => item.bookId === book._id,
    );
    if (!bookProgress) {
      bookProgress = {
        name: book.name,
        grade: book.grade,
        totalLessons: book.totalLessons,
        doneLessons: 0,
        bookId: book._id,
        totalUnits: book.units.length,
        doneQuestions: 0,
        correctQuestions: 0,
        units: [],
        score: 0,
        level: 0,
        lastDid: new Date(),
      };
      userProgress.books.push(bookProgress);
      await userProgress.save();
    }

    const mappedUnits: ProgressUnitMapping[] = book.units
      .map((unit) => {
        if (unit) {
          const unitProgress = bookProgress.units.find(
            (unitProgress) => unitProgress.unitId === unit._id,
          );
          return this.progressesHelper.combineUnitAndProgressUnit(
            unit,
            unitProgress,
          );
        }
      })
      .filter((unit) => unit);
    return this.progressesHelper.combineBookAndProgressBook(
      book,
      bookProgress,
      mappedUnits,
    );
  }

  public async saveUserProgress(
    userId: string,
    lessonTree: LessonTree,
    workInfo: WorkInfo,
  ): Promise<boolean> {
    let hasLesson = false;
    let result = false;
    const {
      bookId,
      book,
      unitId,
      unitTotalLevels,
      lessonTotalQuestions,
      levelIndex,
      levelTotalLessons,
      lessonIndex,
      isLastLesson,
    } = lessonTree;

    const userProgress = await this.getUserProgress(userId);
    if (!userProgress) {
      throw new BadRequestException(`Can't find progress user ${userId}`);
    }
    let progressBook = userProgress.books.find(
      (item) => item.bookId === bookId,
    );
    if (!progressBook) {
      const newProgressBook: ProgressBook = {
        bookId: bookId,
        name: book.name,
        grade: book.grade,
        totalUnits: book.units.length,
        score: 0,
        level: 0,
        doneQuestions: 0,
        correctQuestions: 0,
        totalLessons: book.totalLessons,
        doneLessons: 0,
        lastDid: new Date(),
        units: [],
      };
      userProgress.books.push(progressBook);
      progressBook = newProgressBook;
    }
    const unitInBook = book.units.find((unit) => unit._id === unitId);
    const progressUnit = progressBook.units.find(
      (item) => item.unitId === unitId,
    );
    if (!progressUnit) {
      const newProgressUnit: ProgressUnit = {
        unitId: unitId,
        totalLevels: unitTotalLevels,
        passedLevels: 0,
        doneLessons: 1,
        doneQuestions: workInfo.doneQuestions,
        correctQuestions: lessonTotalQuestions,
        lastDid: workInfo.timeEnd,
        normalImage: unitInBook?.normalImage,
        blueImage: unitInBook?.blueImage,
        levels: [
          {
            levelIndex: levelIndex,
            totalLessons: levelTotalLessons,
            passed: levelTotalLessons === 1,
            doneLessons: 1,
            lessons: [lessonIndex],
          },
        ],
        unitName: unitInBook.name,
        totalLessons: unitInBook.totalLessons,
      };
      progressBook.units.push(newProgressUnit);
    } else {
      const progressLevel = progressUnit.levels.find(
        (item) => item.levelIndex === levelIndex,
      );
      if (!progressLevel) {
        const newProgressLevel: ProgressLevel = {
          levelIndex: levelIndex,
          totalLessons: levelTotalLessons,
          doneLessons: 1,
          passed: levelTotalLessons === 1,
          lessons: [lessonIndex],
        };
        progressUnit.levels.push(newProgressLevel);
      } else {
        const userLesson = progressLevel.lessons.find(
          (item) => Number(item) === Number(lessonIndex),
        );
        if (!userLesson) {
          progressLevel.lessons.push(lessonIndex);
          progressLevel.passed =
            progressLevel.lessons.length == progressLevel.totalLessons;
          if (progressLevel.passed === true) {
            progressUnit.passedLevels++;
            progressBook.level++;
            result = true;
          }
          progressLevel.doneLessons++;
        }
        if (userLesson) {
          hasLesson = true;
        }
      }
      progressUnit.correctQuestions += lessonTotalQuestions;
      progressUnit.lastDid = workInfo.timeEnd;

      if (!isLastLesson && !hasLesson) {
        progressUnit.doneLessons++;
        progressUnit.doneQuestions += workInfo.doneQuestions;
      }
    }
    progressBook.correctQuestions = +lessonTotalQuestions;
    progressBook.lastDid = workInfo.timeEnd;
    progressBook.score++;

    if (!isLastLesson && !hasLesson) {
      progressBook.doneLessons++;
      progressBook.doneQuestions += workInfo.doneQuestions;
    }
    const booksProgress: BookProgressMetaData[] = userProgress.books.map(
      (element) => {
        return {
          doneLessons: element.doneLessons,
          doneQuestions: element.doneQuestions,
          bookId: element.bookId,
        };
      },
    );
    await Promise.all([
      userProgress.save(),
      this.cacheManager.set<BookProgressMetaData[]>(
        `${this.prefixKey}/${userId}/progressBooks`,
        booksProgress,
        { ttl: 86400 },
      ),
    ]);
    return result;
  }

  public async overLevelSaveProgress(
    userId: string,
    lessonTree: Omit<LessonTree, 'lessonIndex'>,
    workInfo: WorkInfo,
  ) {
    const {
      bookId,
      book,
      unitId,
      unitTotalLevels,
      lessonTotalQuestions,
      levelIndex,
      levelTotalLessons,
    } = lessonTree;
    const userProgress = await this.getUserProgress(userId);
    if (!userProgress) {
      throw new BadRequestException('Can not find progress');
    }
    let progressBook = userProgress?.books?.find(
      (element) => element?.bookId === bookId,
    );
    if (!progressBook) {
      progressBook = {
        bookId: book._id,
        name: book.name,
        grade: book.grade,
        totalUnits: book.units.length,
        score: 0,
        level: 0,
        doneQuestions: 0,
        correctQuestions: 0,
        totalLessons: book.totalLessons,
        doneLessons: 0,
        lastDid: new Date(),
        units: [],
      };
      userProgress?.books?.push(progressBook);
    }
    const unitInBook = book.units.find((element) => element._id === unitId);
    const progressUnit = progressBook.units.find(
      (element) => element.unitId === unitId,
    );
    const lessons: Array<number> = [];
    for (let i = 0; i < levelTotalLessons; i++) lessons.push(i);
    if (!progressUnit) {
      const newProgressUnit: ProgressUnit = {
        unitId: unitId,
        totalLevels: unitTotalLevels,
        passedLevels: 1,
        doneLessons: 1,
        doneQuestions: workInfo.doneQuestions,
        correctQuestions: lessonTotalQuestions,
        lastDid: workInfo.timeEnd,
        normalImage: unitInBook?.normalImage,
        blueImage: unitInBook?.blueImage,
        levels: [
          {
            levelIndex: levelIndex,
            totalLessons: levelTotalLessons,
            passed: true,
            doneLessons: levelTotalLessons,
            lessons: lessons,
          },
        ],
        unitName: unitInBook.name,
        totalLessons: unitInBook.totalLessons,
      };
      progressBook.units.push(newProgressUnit);
    } else {
      const progressLevel = progressUnit?.levels?.find(
        (element) => element.levelIndex === levelIndex,
      );
      if (!progressLevel) {
        const newProgressLevel: ProgressLevel = {
          levelIndex: levelIndex,
          totalLessons: levelTotalLessons,
          doneLessons: levelTotalLessons,
          passed: true,
          lessons: lessons,
        };
        progressUnit.levels.push(newProgressLevel);
      } else {
        progressLevel.lessons = lessons;
        progressLevel.passed = true;
      }
      progressUnit.passedLevels++;
      progressUnit.doneLessons += lessons.length;
      progressUnit.doneQuestions += workInfo.doneQuestions;
    }
    progressBook.correctQuestions = +lessonTotalQuestions;
    progressBook.lastDid = workInfo.timeEnd;
    progressBook.score += lessons.length;
    progressBook.doneLessons++;
    progressBook.doneQuestions += workInfo.doneQuestions;
    await userProgress.save();
    return 'Passed level';
  }

  public latestActiveBookProgress(
    userId: string,
  ): Observable<ActiveBookProgress[] | ProgressBook> {
    const unSelect = [
      '-books.totalUnits',
      '-books.units.levels',
      '-books.doneQuestions',
      '-books.correctQuestions',
      '-books.score',
      '-__v',
      '-books._id',
      '-books.level',
    ];
    const progress$ = from(
      this.progressModel
        .findOne({
          userId: Types.ObjectId(userId),
        })
        .select(unSelect)
        .lean(),
    ).pipe(
      map((progress) => {
        if (!progress) {
          return [];
        }
        return progress;
      }),
    );
    return progress$.pipe(
      switchMap((r: LeanDocument<ProgressDocument>) => {
        const books: ProgressBook[] = r?.books;
        if (books && books.length > 0) {
          const learnedBooks = books.filter(
            (book) => book.units && book?.units?.length > 0,
          );
          const lastActiveBooks = learnedBooks.sort((bookOne, bookTwo) => {
            if (bookOne.lastDid < bookTwo.lastDid) return 1;
            if (bookOne.lastDid > bookTwo.lastDid) return -1;
            return 0;
          });
          if (lastActiveBooks?.length > 0)
            return forkJoin(
              lastActiveBooks
                .slice(0, 5)
                .map((book: ProgressBook) =>
                  this.booksService.findBookWithProgressBook(book),
                ),
            );
          return of([]);
        } else {
          return of([]);
        }
      }),
    );
  }

  public getAllUserScoresInProgress(
    userId: string,
  ): Observable<Pick<ScoreOverviewDto, 'correctQuestions' | 'doneLessons'>> {
    return from(
      this.progressModel
        .findOne({
          userId: Types.ObjectId(userId),
        })
        .lean(),
    ).pipe(
      map((progress) => {
        let doneLessons = 0;
        let correctQuestions = 0;
        if (progress && progress.books && progress.books.length > 0) {
          const books = progress.books;
          books.forEach((book) => {
            if (book) {
              doneLessons = doneLessons + book.doneLessons;
              correctQuestions = correctQuestions + book.correctQuestions;
            }
          });
          return {
            doneLessons: doneLessons,
            correctQuestions: correctQuestions,
          };
        }
      }),
    );
  }
  public async isExist(): Promise<boolean> {
    const progresses = await this.progressModel.findOne({});
    return !!progresses;
  }

  public async backupUserProgress() {
    const progresses = await this.progressModel.find({});
    if (progresses?.length > 0) {
      const promises = progresses.map((item) => {
        const books = item.books;
        if (books?.length > 0) {
          const macmillan1Index = books.findIndex(
            (book) => book.bookId === 'tienganh1macmillan',
          );
          const macmillan2Index = books.findIndex(
            (book) => book.bookId === 'tienganh2macmillan',
          );
          if (macmillan1Index !== -1) books.splice(macmillan1Index, 1);
          if (macmillan2Index !== -1) books.splice(macmillan2Index, 1);
          if (macmillan1Index !== -1 || macmillan2Index !== -1)
            return this.progressModel.updateOne(
              {
                _id: item._id,
              },
              {
                $set: {
                  books: books,
                },
              },
            );
        }
      });
      await Promise.all(promises);
    }
  }

  public async rollbackBooks(): Promise<UpdateWriteOpResult> {
    const bookIds = [
      'tienganh12020globalsuccess',
      'tienganh2ctgdpt2018globalsuccess',
      'tienganh6tap12021globalsuccess',
      'tienganh6tap22021globalsuccess',
    ];
    return this.progressModel.updateMany(
      {
        'books.bookId': { $in: bookIds },
      },
      {
        $pull: {
          books: {
            bookId: { $in: bookIds },
          },
        },
      },
    );
  }

  public async removeNullBooksFromProgress() {
    const session = await this.transactionService.createSession();
    session.startTransaction();

    const progresses = await this.progressModel.find({
      books: {
        $elemMatch: {
          $eq: null,
        },
      },
    });
    if (progresses?.length > 0) {
      const removeForSingleProgress = async (progress: ProgressDocument) => {
        const books = progress.books.filter((el) => el);
        return this.progressModel.updateOne(
          {
            userId: progress.userId,
          },
          {
            $set: { books: books },
          },
        );
      };
      const results = await Promise.all(
        progresses.map((element) => removeForSingleProgress(element)),
      );
      return results;
    }
  }

  public async pushToCache() {
    const progresses = await this.progressModel.find().lean();
    if (progresses?.length > 0) {
      await Promise.all([
        progresses.map((progress) => {
          const books = progress?.books;
          const userId = String(progress.userId);
          if (books) {
            const progressBooks: BookProgressMetaData[] = books?.map(
              (element) => {
                return {
                  bookId: element?.bookId ? element?.bookId : '',
                  doneLessons: element?.doneLessons ? element?.doneLessons : 0,
                  doneQuestions: element?.doneQuestions
                    ? element?.doneQuestions
                    : 0,
                };
              },
            );
            return this.cacheManager.set<BookProgressMetaData[]>(
              `${this.prefixKey}/${userId}/progressBooks`,
              progressBooks,
              { ttl: 86400 },
            );
          }
        }),
      ]);
      return;
    }
  }
}
