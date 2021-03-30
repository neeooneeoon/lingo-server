import { Injectable } from '@nestjs/common';
import { QuestionHolderDocument, QuestionHolder, Question } from './schema/question-holder.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuestionHoldersService {
  constructor(@InjectModel(QuestionHolder.name) private readonly questionHolderModel: Model<QuestionHolderDocument>) { }
  findOne(bookId: string, unitId: string, level: number) {
    return this.questionHolderModel.findOne({ bookId: bookId, unitId: unitId, level: level });
  }
  getQuestionPoint(question: Question): number {
    if (question.group == "word") {
      if ([2, 3, 4, 6, 6.4, 6.6, 13, 13.4].includes(question.type))
        return 1;
      else if ([9, 9.4].includes(question.type))
        return 2;
      else if ([7, 11, 12].includes(question.type))
        return 3;
      else if ([8, 14].includes(question.type))
        return 4;
    }
    else {
      if ([10, 12, 2].includes(question.type))
        return 2;
      else if ([1, 17, 7, 4].includes(question.type))
        return 3;
      else if ([14, 15, 16, 18].includes(question.type))
        return 4;
    }
  }
}
