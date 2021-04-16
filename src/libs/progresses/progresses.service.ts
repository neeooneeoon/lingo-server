import { forwardRef, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateProgressDto } from './dto/create-progress.dto';
import { Progress, ProgressDocument, ProgressBook } from './schema/progress.schema';
import { Types, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BookDocument } from '../books/schema/book.schema';
import { ResultMappingHelper } from 'src/helper/resultMapping.helper';
import { LessonTree } from 'src/libs/books/dto/lesson-tree.dto';
import { WorkInfo } from 'src/libs/works/dto/work-info.dto';
import { BooksService } from 'src/libs/books/books.service';
@Injectable()
export class ProgressesService {
  constructor(
    @InjectModel(Progress.name) private readonly progressModel: Model<ProgressDocument>,
    private readonly resultMapping: ResultMappingHelper,
    @Inject(forwardRef(() => BooksService))
    private readonly bookService: BooksService
  ) { }
  async create(createProgressDto: CreateProgressDto) {
    return this.progressModel.create({ userId: createProgressDto.userId, books: createProgressDto.books })
  }

  findProgressByUserId(userId: Types.ObjectId) {
    return this.progressModel.findOne({ userId: userId })
  }

  async getBookProgress(userId: string, book: BookDocument) {
    try {
      let userProgress = await this.findProgressByUserId(Types.ObjectId(userId));
      if (!userProgress) {
        userProgress = await this.progressModel.create({ userId: userId, books: [] })
      }
      console.log(userProgress._id)
      let bookProgress = userProgress.books.find(val => val.bookId == book._id);
      if (!bookProgress) {
        bookProgress = {
          totalLessons: book.totalLessons,
          doneLessons: 0,
          bookId: book._id,
          totalUnits: book.units.length,
          doneQuestions: 0,
          correctQuestions: 0,
          units: [],
          score: 0,
          level: 0,
          lastDid: new Date()
        };
        await this.progressModel.updateOne(
          { userId: userId },
          {
            $push: {
              books: bookProgress
            }
          }
        )
      }
      console.log(bookProgress.doneLessons)
      const units = book.units.map(unit => {
        const unitProgress = bookProgress.units.find(unitProgress => unitProgress.unitId === unit._id);
        if (unitProgress)
          return this.resultMapping.mapUnitWithUserUnitProgress(unit, unitProgress);
        else
          return this.resultMapping.mapUnitWithUserUnitProgress(unit);
      });
      return this.resultMapping.mapBookToBookProgress(book, bookProgress, units);
    }
    catch (e) {
      throw new IntersectionObserver(e);
    }
  }

  async saveProgress(userId: string, lessonTree: LessonTree, workInfo: WorkInfo): Promise<boolean> {
    try {
      let hasLesson = false;
      let result = false;
      const userProgress = await this.progressModel.findOne({ userId: Types.ObjectId(userId) });
      if (!userProgress)
        throw new Error("Can't find user progress");
      let userBook = userProgress.books.find(book => book.bookId == lessonTree.bookId);
      if (!userBook) {
        const book = await this.bookService.findOne(lessonTree.bookId)
        if (!book) {
          throw new Error("Can not find book");
        }
        else {
          const bookProgress: ProgressBook = {
            bookId: lessonTree.bookId,
            totalUnits: book.units.length,
            score: 0,
            level: 0,
            doneQuestions: 0,
            correctQuestions: 0,
            doneLessons: 0,
            totalLessons: book.totalLessons,
            lastDid: new Date(),
            units: []
          };
          await this.progressModel.findOneAndUpdate({ userId: userId }, {
            $push: { books: bookProgress }
          });
          userBook = await userProgress.books.find(book => book.bookId == lessonTree.bookId);
        }
      }
      // throw new Error(`Can't find userProgress ${lessonTree.bookId} of ${userId}`);

      const userUnit = userBook.units.find(unit => unit.unitId == lessonTree.unitId);
      if (!userUnit) {
        const newUserUnit = {
          unitId: lessonTree.unitId,
          totalLevels: lessonTree.unitTotalLevels,
          //* User
          passedLevels: 0,
          doneLessons: 1,
          doneQuestions: workInfo.doneQuestions,
          correctQuestions: lessonTree.lessonTotalQuestions,
          lastDid: workInfo.timeEnd,
          levels: [{
            levelIndex: lessonTree.levelIndex,
            totalLessons: lessonTree.levelTotalLessons,
            passed: lessonTree.levelTotalLessons === 1,
            doneLessons: 1,
            lessons: [lessonTree.lessonIndex]
          }]
        };
        userBook.units.push(newUserUnit);
      } else {
        const userLevel = userUnit.levels.find(level => level.levelIndex === lessonTree.levelIndex);
        if (!userLevel) {
          userUnit.levels.push({
            levelIndex: lessonTree.levelIndex,
            totalLessons: lessonTree.levelTotalLessons,
            passed: lessonTree.levelTotalLessons === 1,
            doneLessons: 1,
            lessons: [lessonTree.lessonIndex]
          });
        } else {
          /// when level exist find lesson
          const userLesson = userLevel.lessons.find(lesson => Number(lesson) === Number(lessonTree.lessonIndex));
          /// if lesson done exist and 
          if (userLesson === undefined) {
            userLevel.lessons.push(lessonTree.lessonIndex);
            userLevel.passed = userLevel.lessons.length === userLevel.totalLessons;
            if (userLevel.passed === true) {
              userUnit.passedLevels++;
              userBook.level++;
              result = true;
            }
            userLevel.doneLessons++;
          }

          if (userLesson)
            hasLesson = true;

        }
        userUnit.correctQuestions += lessonTree.lessonTotalQuestions;
        userUnit.lastDid = workInfo.timeEnd;

        if (!lessonTree.isLastLesson && hasLesson === false) {
          userUnit.doneLessons++;
          userUnit.doneQuestions += workInfo.doneQuestions;
        }
      }
      userBook.correctQuestions += lessonTree.lessonTotalQuestions;
      userBook.lastDid = workInfo.timeEnd;
      userBook.score++;

      if (!lessonTree.isLastLesson && hasLesson === false) {
        userBook.doneLessons++;
        userBook.doneQuestions += workInfo.doneQuestions;
      }

      await this.progressModel.updateOne(
        {
          userId: userId
        },
        {
          $set: { "books.$[book]": userBook },
          lastDid: workInfo.timeEnd
        },
        {
          arrayFilters: [{ "book.bookId": lessonTree.bookId }]
        }
      );
      return result;
    }
    catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

}
