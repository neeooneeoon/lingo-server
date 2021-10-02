import { OverLevelCalculating } from '@dto/works';
import { LeanDocument, Model, Types } from 'mongoose';
import { Work, WorkDocument } from '@entities/work.entity';
import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QuestionHoldersService } from '@libs/questionHolders/providers/questionHolders.service';
import { LessonTree } from '@dto/book';
import { AnswerResult } from '@dto/lesson';
import { LevelWork, UnitWork, WorkInfo } from '@dto/works';
import { AnswerService } from '@libs/questionHolders/providers/answer.service';
import { PointService } from '@libs/questionHolders/providers/point.service';
import { UserProfile } from '@dto/user';
import { ConfigsService } from '@configs';
import { Cache } from 'cache-manager';
import { QuestionDocument } from '@entities/question.entity';
import { TransactionService } from '@connect/transaction.service';

@Injectable()
export class WorksService {
  private prefixKey: string;
  constructor(
    @InjectModel(Work.name) private workModel: Model<WorkDocument>,
    private questionHoldersService: QuestionHoldersService,
    private answerService: AnswerService,
    private pointService: PointService,
    private configsService: ConfigsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly transactionService: TransactionService,
  ) {
    this.prefixKey = this.configsService.get('MODE');
  }

  public async createUserWork(userId: string, bookId: string): Promise<void> {
    try {
      await this.workModel.create({
        userId: Types.ObjectId(userId),
        bookId: bookId,
        units: [],
      });
      return;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async findUserWork(userId: string, bookId: string) {
    return this.workModel
      .findOne({
        bookId: bookId,
        userId: Types.ObjectId(userId),
      })
      .select(['_id'])
      .lean();
  }

  public async getUserWork(
    userId: string,
    bookId: string,
  ): Promise<LeanDocument<WorkDocument> | undefined> {
    try {
      let userWork = await this.cacheManager.get<LeanDocument<WorkDocument>>(
        `${this.prefixKey}/${userId}/${bookId}/unitWorks`,
      );
      if (!userWork) {
        userWork = await this.workModel
          .findOne({
            bookId: bookId,
            userId: Types.ObjectId(userId),
          })
          .lean();
        if (!userWork) {
          throw new BadRequestException();
        }
        await this.cacheManager.set<LeanDocument<WorkDocument>>(
          `${this.prefixKey}/userWork/${userId}/${bookId}`,
          userWork,
          { ttl: 7200 },
        );
        return userWork;
      }
      return userWork;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async saveUserWork(
    user: UserProfile & { _id: string },
    lessonTree: LessonTree,
    workInfo: WorkInfo,
    results: AnswerResult[],
  ): Promise<number> {
    try {
      const {
        bookId,
        unitId,
        levelIndex,
        lessonIndex,
        unitTotalLevels,
        lessonTotalQuestions,
        isLastLesson,
      } = lessonTree;

      // const userWorkPromise = this.getUserWork(user._id, bookId);
      // const questionHolderPromise =
      //   this.questionHoldersService.getQuestionHolder({
      //     bookId: bookId,
      //     unitId: unitId,
      //     level: levelIndex,
      //   });
      // eslint-disable-next-line prefer-const
      let [userWork, questions] = await Promise.all([
        this.getUserWork(user._id, bookId),
        this.cacheManager.get<LeanDocument<QuestionDocument>[] | null>(
          `${this.prefixKey}/questionHolder/${bookId}/${unitId}/${levelIndex}`,
        ),
      ]);
      if (!questions) {
        const questionHolder =
          await this.questionHoldersService.getQuestionHolder({
            bookId: bookId,
            unitId: unitId,
            level: levelIndex,
          });
        questions = questionHolder.questions;
        await this.cacheManager.set<LeanDocument<QuestionDocument>[]>(
          `${this.prefixKey}/questionHolder/${bookId}/${unitId}/${levelIndex}`,
          questions,
          { ttl: 7200 },
        );
      }
      // const questions = await this.cacheManager.get<
      //   LeanDocument<QuestionDocument>[] | null
      // >(`${this.prefixKey}/questionHolder/${bookId}/${unitId}/${levelIndex}`);
      // let userWork: LeanDocument<WorkDocument>;
      // let questionHolder: LeanDocument<QuestionHolderDocument>;
      // await Promise.all([userWorkPromise, questionHolderPromise])
      //   .then(([userWorkResult, questionHolderResult]) => {
      //     // userWork = userWorkResult;
      //     questionHolder = questionHolderResult;
      //   })
      //   .catch((error) => {
      //     throw new InternalServerErrorException(error);
      //   });
      let unitIndex = userWork.units.findIndex(
        (item) => item.unitId === unitId,
      );
      let levelWorkIndex = 0;
      let lessonWorkIndex = 0;

      if (unitIndex === -1) {
        const newUnit: UnitWork = {
          unitId: unitId,
          levels: [
            {
              levelIndex: levelIndex,
              lessons: [
                {
                  lessonIndex: lessonIndex,
                  works: [],
                },
              ],
              incorrectList: [],
            },
          ],
          incorrectList: [],
          didList: [],
        };
        userWork.units.push(newUnit);
        unitIndex = userWork.units.length - 1;
      } else {
        const unitWork = userWork.units[unitIndex];
        levelWorkIndex = unitWork.levels.findIndex(
          (item) => item.levelIndex === levelIndex,
        );
        if (levelWorkIndex === -1) {
          const newLevelWork: LevelWork = {
            levelIndex: levelIndex,
            lessons: [
              {
                lessonIndex: lessonIndex,
                works: [],
              },
            ],
            incorrectList: [],
          };
          userWork.units[unitIndex].levels.push(newLevelWork);
          levelWorkIndex = userWork.units[unitIndex].levels.length - 1;
        } else {
          const levelWork = unitWork.levels[levelWorkIndex];
          lessonWorkIndex = levelWork.lessons.findIndex(
            (item) => item.lessonIndex === lessonIndex,
          );
          if (lessonWorkIndex === -1) {
            userWork.units[unitIndex].levels[levelWorkIndex].lessons.push({
              lessonIndex: lessonIndex,
              works: [],
            });
            lessonWorkIndex =
              userWork.units[unitIndex].levels[levelWorkIndex].lessons.length -
              1;
          }
        }
      }
      const unitWork = userWork.units[unitIndex];
      const unitIncorrectList = unitWork.incorrectList;
      const didList = unitWork.didList;
      // const levelWork = unitWork.levels[levelWorkIndex];
      // const levelIncorrectList = levelWork.incorrectList;

      let questionPoint = 0;
      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          if (!results[i]) continue;
          const question = questions?.find(
            (item) => item._id === results[i]._id,
          );
          if (!question) {
            questionPoint += 1;
            continue;
          }

          // const isCorrect = await this.answerService.checkAnswer(
          //   results[i],
          //   question,
          // );
          if (levelIndex == unitTotalLevels - 1) {
            const isExist = unitIncorrectList.find(
              (item) => item === results[i]._id,
            );
            if (true) {
              if (isExist) {
                didList.push(results[i]._id);
              }
              questionPoint += this.pointService.getQuestionPoint(question);
              results[i].status = true;
            }
            // else {
            //   results[i].status = false;
            // }
          } else {
            if (true) {
              questionPoint += this.pointService.getQuestionPoint(question);
              results[i].status = true;
            }
            // else {
            //   if (!unitIncorrectList.find((val) => val === results[i]._id)) {
            //     unitIncorrectList.push(results[i]._id);
            //   }
            //   if (!levelIncorrectList.find((val) => val === results[i]._id)) {
            //     levelIncorrectList.push(results[i]._id);
            //   }
            //   results[i].status = false;
            // }
          }
        }
      }
      unitWork.levels[levelWorkIndex].lessons[lessonWorkIndex].works.push({
        results: results,
        timeStart: workInfo.timeStart,
        timeEnd: workInfo.timeEnd,
      });
      await this.workModel.updateOne(
        {
          _id: Types.ObjectId(String(userWork._id)),
        },
        {
          $set: {
            units: userWork.units,
          },
        },
      );
      // await userWork.save();
      // const bonusStreak = this.pointService.getBonusStreak(user.streak);
      const accuracy = lessonTotalQuestions / workInfo.doneQuestions;
      questionPoint = Number.isNaN(accuracy)
        ? questionPoint
        : questionPoint * accuracy;
      const bonusLevel = levelIndex + 1;
      const bonusLesson = isLastLesson ? 1 : 0;
      return Number.isNaN(Math.floor(questionPoint + bonusLevel + bonusLesson))
        ? 0
        : Math.floor(questionPoint + bonusLevel + bonusLesson);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async calculatePointForOverLevel(input: OverLevelCalculating) {
    try {
      const { bookId, unitId, levelIndex, results, workInfo } = input;
      let questions = await this.cacheManager.get<
        LeanDocument<QuestionDocument>[] | null
      >(`${this.prefixKey}/questionHolder/${bookId}/${unitId}/${levelIndex}`);
      if (!questions) {
        const questionHolders =
          await this.questionHoldersService.getQuestionHolder({
            bookId: bookId,
            unitId: unitId,
            level: levelIndex,
          });
        if (!questionHolders || !questionHolders?.questions) {
          throw new BadRequestException();
        }
        questions = questionHolders.questions;
        await this.cacheManager.set<LeanDocument<QuestionDocument>[]>(
          `${this.prefixKey}/questionHolder/${bookId}/${unitId}/${levelIndex}`,
          questions,
          { ttl: 7200 },
        );
      }
      let totalPoint = 0;
      let correctAnswer = 0;
      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          if (!results[i]) continue;
          const question = questions.find(
            (element) => element._id === results[i]._id,
          );
          if (!question) {
            correctAnswer++;
            continue;
          }
          const isCorrect = await this.answerService.checkAnswer(
            results[i],
            question,
          );
          if (isCorrect) {
            totalPoint += this.pointService.getQuestionPoint(question);
            correctAnswer++;
          }
        }
      }
      return {
        totalPoint,
        correctAnswer,
        totalQuestions: workInfo.totalQuestions,
        percentage: Math.round(correctAnswer / workInfo.totalQuestions) * 100,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }
  public async isExist(): Promise<boolean> {
    const work = this.workModel.findOne({});
    return !!work;
  }

  public async backup() {
    return this.workModel.deleteMany({
      bookId: {
        $in: ['tienganh1macmillan', 'tienganh2macmillan'],
      },
    });
  }

  public async rollbackBooks() {
    const bookIds = [
      'tienganh12020globalsuccess',
      'tienganh2ctgdpt2018globalsuccess',
      'tienganh6tap12021globalsuccess',
      'tienganh6tap22021globalsuccess',
    ];
    return this.workModel.deleteMany({
      bookId: { $in: bookIds },
    });
  }

  public async pushToCache() {
    // const userWorks: Array<{ user: string; books: string[] }> =
    //   await this.workModel.aggregate([
    //     {
    //       $group: {
    //         _id: { user: '$userId' },
    //         books: { $addToSet: '$bookId' },
    //       },
    //     },
    //     {
    //       $project: {
    //         user: '$_id.user',
    //         books: '$books',
    //         _id: 0,
    //       },
    //     },
    //   ]);
    // await Promise.all(
    //   userWorks.map((element) => {
    //     return this.cacheManager.set<Array<string>>(
    //       `${this.prefixKey}/userWorks/${element.user}/listBookIds`,
    //       element.books,
    //       { ttl: 86400 },
    //     );
    //   }),
    // );
    // return;
  }
}
