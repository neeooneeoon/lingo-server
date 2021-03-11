import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { Progress, ProgressDocument } from './schema/progress.schema';
import { Types, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BookDocument } from '../books/schema/book.schema';
import { mapUnitWithUserUnitProgress, mapBookToBookProgress } from 'src/common/result.map';

@Injectable()
export class ProgressesService {
  constructor(@InjectModel(Progress.name) private readonly progressModel: Model<ProgressDocument>) { }
  async create(createProgressDto: CreateProgressDto) {
    return this.progressModel.create({ userId: createProgressDto.userId, books: createProgressDto.books })
  }

  findProgressByUserId(userId: string | Types.ObjectId) {
    return this.progressModel.findOne({ userId: userId })
  }

  async getBookProgress(userId: string, book: BookDocument) {
    try {
      let userProgress = await this.findProgressByUserId(userId);
      if (!userProgress) {
        userProgress = await this.progressModel.create({ userId: userId, books: [] })
      }
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
      const units = book.units.map(unit => {
        const unitProgress = bookProgress.units.find(unitProgress => unitProgress.unitId === unit._id);
        if (unitProgress)
          return mapUnitWithUserUnitProgress(unit, unitProgress);
        else
          return mapUnitWithUserUnitProgress(unit);
      });
      return mapBookToBookProgress(book, bookProgress, units);
    }
    catch (e) {
      throw new IntersectionObserver(e);
    }
  }

  findAll() {
    return `This action returns all progresses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} progress`;
  }

  update(id: number, updateProgressDto: UpdateProgressDto) {
    return `This action updates a #${id} progress`;
  }

  remove(id: number) {
    return `This action removes a #${id} progress`;
  }
}
