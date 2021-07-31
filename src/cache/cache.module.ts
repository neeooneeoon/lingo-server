import {
  Module,
  OnModuleInit,
  CacheModule as BaseCacheModule,
  Inject,
  CACHE_MANAGER,
  Logger,
} from '@nestjs/common';
import { ConfigsModule, ConfigsService } from '@configs';
import { Cache } from 'cache-manager';

@Module({
  imports: [
    ConfigsModule,
    BaseCacheModule.registerAsync({
      inject: [ConfigsService],
      useFactory: async (configsService: ConfigsService) => {
        return configsService.getRedisConfig();
      },
    }),
  ],
  exports: [BaseCacheModule],
})
export class CacheModule implements OnModuleInit {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  public onModuleInit(): any {
    const logger = new Logger('Cache');
    const commands = ['get', 'set', 'del', 'store'];
    const cache = this.cache;
    commands.forEach((commandName) => {
      const oldCommand = cache[commandName];
      cache[commandName] = async (...args) => {
        const start = new Date();
        const result = await oldCommand.call(cache, ...args);
        const end = new Date();
        const duration = end.getTime() - start.getTime();

        args = args.slice(0, 2);
        logger.log(
          `${commandName.toUpperCase()} ${args
            .join(', ')
            .slice(0, 100)} - ${duration}ms`,
        );
        return result;
      };
    });
  }
}
