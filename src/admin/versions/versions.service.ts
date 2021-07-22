import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Version, VersionDocument } from '@entities/version.entity';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { MatchVersionDto } from '@dto/version';

@Injectable()
export class VersionsService {
  constructor(
    @InjectModel(Version.name)
    private readonly versionModel: Model<VersionDocument>,
  ) {}

  public async updateAppVersion(
    tag: string,
    description?: string,
  ): Promise<VersionDocument> {
    const instance = await this.versionModel.findOne({});
    if (!instance)
      return this.versionModel.create({
        tag: tag,
        description: description ? description : '',
      });
    return this.versionModel.findOneAndUpdate(
      {},
      {
        $set: {
          tag: tag,
          description: description ? description : '',
        },
      },
      { new: true },
    );
  }

  public async checkMatchVersion(tag: string): Promise<MatchVersionDto> {
    const version = await this.versionModel.findOne({});
    if (version) {
      if (version.tag.trim() === tag.trim())
        return {
          isMatch: true,
          currentVersion: tag,
        };
      else {
        return {
          isMatch: false,
          currentVersion: version.tag,
        };
      }
    }
    throw new NotFoundException("Can't find version");
  }
}
