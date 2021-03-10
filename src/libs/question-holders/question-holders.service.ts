import { Injectable } from '@nestjs/common';
import { CreateQuestionHolderDto } from './dto/create-question-holder.dto';
import { UpdateQuestionHolderDto } from './dto/update-question-holder.dto';

@Injectable()
export class QuestionHoldersService {
  create(createQuestionHolderDto: CreateQuestionHolderDto) {
    return 'This action adds a new questionHolder';
  }

  findAll() {
    return `This action returns all questionHolders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} questionHolder`;
  }

  update(id: number, updateQuestionHolderDto: UpdateQuestionHolderDto) {
    return `This action updates a #${id} questionHolder`;
  }

  remove(id: number) {
    return `This action removes a #${id} questionHolder`;
  }
}
