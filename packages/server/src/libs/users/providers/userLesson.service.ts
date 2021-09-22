import { SaveLessonDto } from '@dto/user/saveLesson.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigsService } from '@configs';
import { TransactionService } from '@connect';
import { UserDocument, User } from '@entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from './users.service';
import { AnswerResult } from '@dto/lesson';
import { WorkInfo } from '@dto/works';
import { BooksService } from '@libs/books/providers/books.service';
import { WorksService } from '@libs/works/works.service';
import { ProgressesService } from '@libs/progresses/progresses.service';

@Injectable()
export class UserLessonService {
  private prefixKey: string;

  constructor(
    private configsService: ConfigsService,
    private transactionService: TransactionService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usesService: UsersService,
    private booksService: BooksService,
    private worksService: WorksService,
    private progressesService: ProgressesService,
  ) {
    this.prefixKey = this.configsService.get('MODE');
  }

  public async submitOverLevel(
    userId: string,
    input: Omit<SaveLessonDto, 'lessonIndex'>,
  ) {
    // const session = await this.transactionService.createSession();
    // session.startTransaction();
    const userProfile = await this.usesService.findUser(userId).toPromise();
    if (!userProfile) {
      throw new BadRequestException('User not found');
    }
    const { doneQuestions, timeEnd, timeStart, totalQuestions } = input;
    const userWork: WorkInfo = {
      doneQuestions: doneQuestions,
      totalQuestions: totalQuestions,
      timeStart: new Date(timeStart),
      timeEnd: new Date(timeEnd),
    };
    const lessonTree = await this.booksService.getLessonTree({
      bookId: input.bookId,
      unitId: input.unitId,
      levelIndex: input.levelIndex,
      isOverLevel: true,
    });
    if (!lessonTree) {
      throw new BadRequestException(`Can't find lessonTree with ${input}`);
    }
    const lessonResult: AnswerResult[] = input.results.map((result) => ({
      ...result,
      status: false,
    }));
    const result = await this.worksService.calculatePointForOverLevel({
      bookId: input.bookId,
      unitId: input.unitId,
      levelIndex: input.levelIndex,
      workInfo: userWork,
      results: lessonResult,
    });
    if (result?.percentage >= 80) {
      const message = await this.progressesService.overLevelSaveProgress(
        userId,
        lessonTree,
        userWork,
      );
      // await session.commitTransaction();
      // session.endSession();
      return {
        message,
        success: true,
        passed: true,
      };
    }
    // await session.commitTransaction();
    // session.endSession();
    return {
      message: 'Not passed',
      success: true,
      passed: false,
    };
  }
}
