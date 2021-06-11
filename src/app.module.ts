import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigsModule, ConfigsService } from '@configs';
import { BooksModule } from 'src/dto/libs/books';
import { UsersModule } from 'src/dto/libs/users';

@Module({
  imports: [
    ConfigsModule,
    MongooseModule.forRootAsync({
      inject: [ConfigsService],
      useFactory: async (configsService: ConfigsService) => configsService.getMongoConfig(),
    }),
    BooksModule,
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
