import { CreateStoryReportDto } from '@dto/stories';
import { BadRequestException, Injectable } from '@nestjs/common';
import { StoryReportDocument, StoryReport } from '@entities/storyReport.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import emojiRegex from 'emoji-regex/RGI_Emoji';

@Injectable()
export class StoryReportsService {
  constructor(
    @InjectModel(StoryReport.name)
    private readonly storyReportModel: Model<StoryReportDocument>,
  ) {}

  public async create(userId: string, input: CreateStoryReportDto) {
    const regex = emojiRegex();
    if (input?.comment?.length > 100) {
      throw new BadRequestException('Limit 100 characters');
    }
    if (input?.comment && regex.test(input.comment)) {
      throw new BadRequestException('Contain emoji icon');
    }
    if (input?.contents?.length > 0) {
      input.contents.forEach((el) => {
        if (el.length == 0 || el.length > 100 || regex.test(el)) {
          throw new BadRequestException();
        }
      });
    }
    return this.storyReportModel.create({
      user: Types.ObjectId(userId),
      storyQuestion: Types.ObjectId(input.storyQuestion),
      contents: input.contents,
      comment: input.comment,
    });
  }
}
