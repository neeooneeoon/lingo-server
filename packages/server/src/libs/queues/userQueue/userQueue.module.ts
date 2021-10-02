import { UsersModule } from '@libs/users';
import { UserQueueController } from './controller';
import { ConfigsService } from '@configs';
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { UserQueueService } from './service';
import { UserProcessor } from './processor';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'user',
      inject: [ConfigsService],
      useFactory: async (configsService: ConfigsService) => ({
        redis: {
          host: configsService.get('REDIS_HOST'),
          port: Number(configsService.get('REDIS_PORT')),
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [UserQueueController],
  providers: [UserQueueService, UserProcessor],
  exports: [UserQueueService],
})
export class UserQueueModule {}
