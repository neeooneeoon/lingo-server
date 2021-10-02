import { StoriesModule } from '@libs/stories';
import { BooksModule } from '@libs/books';
import { ConfigsService } from '@configs';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { BookProcessor } from './book.processor';
import { BookQueueService } from './book.service';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'book',
      inject: [ConfigsService],
      useFactory: async (configsService: ConfigsService) => ({
        redis: {
          host: configsService.get('REDIS_HOST'),
          port: Number(configsService.get('REDIS_PORT')),
        },
      }),
    }),
    BooksModule,
    StoriesModule,
  ],
  providers: [BookQueueService, BookProcessor],
})
export class BookQueueModule {}
