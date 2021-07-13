import * as dotenv from 'dotenv';

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

  public getPortConfig() {
    return this.get('PORT');
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
}
