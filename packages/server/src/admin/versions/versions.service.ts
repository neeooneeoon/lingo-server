import { MAX_TTL } from '@utils/constants';
import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Version, VersionDocument } from '@entities/version.entity';
import { Model } from 'mongoose';
import { MatchVersionDto } from '@dto/version';
import { Cache } from 'cache-manager';
import { ConfigsService } from '@configs';

@Injectable()
export class VersionsService {
  private prefixKey: string;
  constructor(
    @InjectModel(Version.name)
    private readonly versionModel: Model<VersionDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configsService: ConfigsService,
  ) {
    this.prefixKey = this.configsService.get('MODE');
  }

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
    const version = await this.versionModel.findOneAndUpdate(
      {},
      {
        $set: {
          tag: tag,
          description: description ? description : '',
        },
      },
      { new: true },
    );
    await this.cacheManager.set<VersionDocument>(
      `${this.prefixKey}/currentVersion`,
      version,
      { ttl: 86400 },
    );
    return version;
  }

  public async checkMatchVersion(tag: string): Promise<MatchVersionDto> {
    let currentVersion = await this.cacheManager.get<VersionDocument>(
      `${this.prefixKey}/currentVersion`,
    );
    if (!currentVersion) {
      currentVersion = await this.versionModel.findOne({});
      await this.cacheManager.set<VersionDocument>(
        `${this.prefixKey}/currentVersion`,
        currentVersion,
        { ttl: 86400 },
      );
    }
    if (currentVersion) {
      if (currentVersion.tag.trim() === tag.trim())
        return {
          isMatch: true,
          currentVersion: tag,
        };
      else {
        return {
          isMatch: false,
          currentVersion: currentVersion.tag,
        };
      }
    }
    throw new NotFoundException("Can't find version");
  }

  public async getCurrentVersion(): Promise<VersionDocument> {
    let currentVersion = await this.cacheManager.get<VersionDocument>(
      `${this.prefixKey}/currentVersion`,
    );
    if (!currentVersion) {
      currentVersion = await this.versionModel.findOne({});
      await this.cacheManager.set<VersionDocument>(
        `${this.prefixKey}/currentVersion`,
        currentVersion,
        { ttl: 86400 },
      );
    }
    return currentVersion;
  }

  public async pushToCache() {
    const currentVersion = (await this.versionModel
      .findOne({})
      .lean()) as VersionDocument;
    await this.cacheManager.set<VersionDocument>(
      `${this.prefixKey}/currentVersion`,
      currentVersion,
      { ttl: MAX_TTL },
    );
  }
}
