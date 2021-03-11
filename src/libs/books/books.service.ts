import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, BookDocument } from './schema/book.schema';
import { Model, Types } from 'mongoose';
import { ProgressesService } from 'src/libs/progresses/progresses.service';
import { WorksService } from 'src/libs/works/works.service';

@Injectable()
export class BooksService {

  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
    private readonly progressService: ProgressesService,
    private readonly workService: WorksService,
    ) {}

  create(createBookDto: CreateBookDto) {
    return 'This action adds a new book';
  }

  async findAll(): Promise<BookDocument[]> {
    try {
      const data = await this.bookModel.find();
      return data;
    }
    catch(e) {
      throw new InternalServerErrorException(e)
    }
  }

  async findOne(id: string): Promise<BookDocument> {
    try {
      const book = await this.bookModel.findById(id);
      if (book) {
        return book;
      }
      else {
        throw new HttpException("Book Not Found", HttpStatus.BAD_REQUEST);
      }
    }
    catch(e) {
      throw new InternalServerErrorException(e)
    }
  }

  async getBooksByGrade(grade: number, userId: Types.ObjectId): Promise<any> {
    try {
      const books = await this.bookModel.find({ grade: grade })
      let userProgress = await this.progressService.findProgressByUserId(userId);
      if (!userProgress) {
        userProgress = await this.progressService.create({ userId: userId, books: [] });
      }
      const booksLatestResult = books.map(book => {
        const bookProgress = userProgress.books.find(bookProgress => bookProgress.bookId === book._id);
        return {
          _id: book._id,
          name: book.name,
          grade: book.grade,
          cover: book.cover,
          totalWords: book.totalWords,
          totalUnits: book.totalUnits,
          description: book.description,
          totalQuestions: book.totalQuestions,
          totalLessons: book.totalLessons,
          doneLessons: bookProgress ?
            (bookProgress.doneLessons > book.totalLessons ? book.totalLessons : bookProgress.doneLessons) : 0,
          doneQuestions: bookProgress ?
            (bookProgress.doneQuestions > book.totalQuestions ? book.totalQuestions : bookProgress.doneQuestions) : 0,
        }
      })
      return booksLatestResult;
    }
    catch(e) {
      throw new InternalServerErrorException(e)
    }
  }

  async getUnitsByBookId(userId: string, bookId: string) {
    try {
      const book = await this.bookModel.findById(bookId);
      if (!book) {
        throw new HttpException("Cant not found book", HttpStatus.NOT_FOUND);
      }
      else {
        const currentBookWorker = await this.workService.findCurrentBookWorking(userId, bookId);
        if (!currentBookWorker) {
          await this.workService.create({ userId: userId, bookId: bookId, units: [] });
        }
        const userBookProgress = await this.progressService.getBookProgress(userId, book);
        return userBookProgress;
      }
    }
    catch(e) {
      throw new InternalServerErrorException(e)
    }
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
