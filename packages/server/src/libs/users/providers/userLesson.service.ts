import { SaveLessonDto } from '@dto/user/saveLesson.dto';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  CACHE_MANAGER,
} from '@nestjs/common';
import { ConfigsService } from '@configs';
import { TransactionService } from '@connect';
import { UserDocument, User } from '@entities/user.entity';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { UsersService } from './users.service';
import { AnswerResult } from '@dto/lesson';
import { WorkInfo } from '@dto/works';
import { BooksService } from '@libs/books/providers/books.service';
import { WorksService } from '@libs/works/works.service';
import { ProgressesService } from '@libs/progresses/progresses.service';
import { Cache } from 'cache-manager';

@Injectable()
export class UserLessonService {
  private prefixKey: string;
  private readonly logger = new Logger(UserLessonService.name);

  constructor(
    private configsService: ConfigsService,
    private transactionService: TransactionService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usesService: UsersService,
    private booksService: BooksService,
    private worksService: WorksService,
    private progressesService: ProgressesService,
    @InjectConnection() private connection: Connection,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.prefixKey = this.configsService.get('MODE');
  }

  public async submitOverLevel(
    userId: string,
    input: Omit<SaveLessonDto, 'lessonIndex'>,
  ) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // eslint-disable-next-line prefer-const
      let [userProfile, lessonTree] = await Promise.all([
        this.cacheManager.get(`${this.prefixKey}/profile/${userId}`),
        this.booksService.getLessonTree({
          bookId: input.bookId,
          unitId: input.unitId,
          levelIndex: input.levelIndex,
          isOverLevel: true,
        }),
      ]);
      if (!lessonTree) {
        throw new BadRequestException(`Can't find lessonTree with ${input}`);
      }
      if (!userProfile) {
        userProfile = await this.usesService.findUser(userId).toPromise();
      }
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
        return {
          message,
          success: true,
          passed: true,
        };
      }
      return {
        message: 'Not passed',
        success: true,
        passed: false,
      };
      // await session.commitTransaction();
    } catch (error) {
      this.logger.warn(error);
      await session.abortTransaction();
      throw new InternalServerErrorException(error);
    } finally {
      session.endSession();
    }
  }
}
