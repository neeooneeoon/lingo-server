import * as dotenv from 'dotenv';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModuleOptions } from '@nestjs/common';

export class ConfigsService {
  private readonly envConfig: Record<string, string>;

  constructor() {
    const result = dotenv.config();
    if (result.error) {
      this.envConfig = process.env;
    } else {
      this.envConfig = result.parsed;
    }
  }

  public get(key: string): string {
    return this.envConfig[key];
  }

  public getMongoConfig() {
    return {
      uri: this.get('MONGODB_URI_LOCAL'),
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    };
  }

  public getRedisConfig(): CacheModuleOptions {
    return {
      store: redisStore,
      host: this.get('REDIS_HOST'),
      port: this.get('REDIS_PORT'),
    };
  }
}
