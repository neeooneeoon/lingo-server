import { Injectable } from '@nestjs/common';
import { CreateQuestionHolderDto } from './dto/create-question-holder.dto';
import { UpdateQuestionHolderDto } from './dto/update-question-holder.dto';
import { QuestionHolderDocument, QuestionHolder } from './schema/question-holder.schema';
import{ InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuestionHoldersService {
  constructor(@InjectModel(QuestionHolder.name) private readonly questionHolderModel: Model<QuestionHolderDocument>) {}
  create(createQuestionHolderDto: CreateQuestionHolderDto) {
    return 'This action adds a new questionHolder';
  }

  findAll() {
    return `This action returns all questionHolders`;
  }

  findOne(bookId: string, unitId: string) {
    return this.questionHolderModel.findOne({ bookId: bookId, unitId: unitId });
  }

  update(id: number, updateQuestionHolderDto: UpdateQuestionHolderDto) {
    return `This action updates a #${id} questionHolder`;
  }

  remove(id: number) {
    return `This action removes a #${id} questionHolder`;
  }
}
