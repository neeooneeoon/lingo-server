import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book, BookDocument } from './schema/book.schema';
import { Model } from 'mongoose';
@Injectable()
export class BooksService {

  constructor(@InjectModel(Book.name) private readonly bookModel: Model<BookDocument>) {}

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

  findOne(id: number) {
    return `This action returns a #${id} book`;
  }

  update(id: number, updateBookDto: UpdateBookDto) {
    return `This action updates a #${id} book`;
  }

  remove(id: number) {
    return `This action removes a #${id} book`;
  }
}
