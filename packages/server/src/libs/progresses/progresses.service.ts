import { LeanDocument, Model, Types, UpdateWriteOpResult } from 'mongoose';
import { Progress, ProgressDocument } from '@entities/progress.entity';
import {
  BadRequestException,
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

@Injectable()
export class ProgressesService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    private progressesHelper: ProgressesHelper,
    @Inject(forwardRef(() => BooksService)) private booksService: BooksService,
  ) {}

  async createUserProgress(
    input: CreateUserProgressDto,
  ): Promise<ProgressDocument> {
    return this.progressModel.create({
      userId: Types.ObjectId(String(input.userId)),
      books: input.books,
    });
  }

  async getUserProgress(userId: string): Promise<ProgressDocument> {
    return this.progressModel.findOne({ userId: Types.ObjectId(userId) });
  }

  async getBookProgress(
    userId: string,
    book: BookDocument,
  ): Promise<ProgressBookMapping> {
    let userProgress = await this.getUserProgress(userId);
    if (!userProgress) {
      userProgress = await this.createUserProgress({
        userId: Types.ObjectId(userId),
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
    await userProgress.save();
    return result;
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
            (book) => book.units && book.units.length > 0,
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
}
