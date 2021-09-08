import { CreateStoryReportDto } from '@dto/stories';
import { Injectable } from '@nestjs/common';
import { StoryReportDocument, StoryReport } from '@entities/storyReport.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class StoryReportsService {
  constructor(
    @InjectModel(StoryReport.name)
    private readonly storyReportModel: Model<StoryReportDocument>,
  ) {}

  public async create(input: CreateStoryReportDto) {
    return this.storyReportModel.create(input);
  }
}
