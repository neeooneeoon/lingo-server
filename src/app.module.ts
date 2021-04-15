import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BooksModule } from './libs/books/books.module';
import { UsersModule } from './libs/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { WordsModule } from './libs/words/words.module';
import { SentencesModule } from './libs/sentences/sentences.module';
import { UnitsModule } from './libs/units/units.module';
import { QuestionHoldersModule } from './libs/question-holders/question-holders.module';
import { CaslModule } from './authorization/casl/casl.module';
import { ProgressesModule } from './libs/progresses/progresses.module';
import { WorksModule } from './libs/works/works.module';
import { ReportModule } from './libs/report/report.module';
import { LeaderBoardModule } from './libs/leaderBoard/leaderBoard.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.DB_URL
    ),
    BooksModule,
    UsersModule,
    WordsModule,
    SentencesModule,
    UnitsModule,
    QuestionHoldersModule,
    CaslModule,
    ProgressesModule,
    WorksModule,
    ReportModule,
    LeaderBoardModule
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
