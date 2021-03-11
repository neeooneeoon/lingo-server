import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Work, WorkDocument } from './schema/work.schema';

@Injectable()
export class WorksService {

  constructor(@InjectModel(Work.name) private readonly workModel: Model<WorkDocument>) {}

  create(createWorkDto: CreateWorkDto) {
    return this.workModel.create({ userId: createWorkDto.userId, bookId: createWorkDto.bookId, units: createWorkDto.units });
  }

  async findCurrentBookWorking(userId: Types.ObjectId | string, bookId: string) {
    try {
      const currentWorker = await this.workModel.findOne({ userId: userId, bookId: bookId });
      return currentWorker;
    }
    catch(e) {
      throw new InternalServerErrorException(e)
    }
  }

  findAll() {
    return `This action returns all works`;
  }

  findOne(id: number) {
    return `This action returns a #${id} work`;
  }

  update(id: number, updateWorkDto: UpdateWorkDto) {
    return `This action updates a #${id} work`;
  }

  remove(id: number) {
    return `This action removes a #${id} work`;
  }
}
