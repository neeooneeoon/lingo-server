import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateWorkDto } from './dto/create-work.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Work, WorkDocument } from './schema/work.schema';
import { UserDocument } from '../users/schema/user.schema';
import { LessonTree } from 'src/libs/books/dto/lesson-tree.dto';
import { WorkInfo } from './dto/work-info.dto';
import { Result } from './dto/result.dto'
import { QuestionHoldersService } from 'src/libs/question-holders/question-holders.service';
import { UnitWork, LevelWork } from './schema/work.schema';
import { WordsService } from 'src/libs/words/words.service';
@Injectable()
export class WorksService {

  constructor(
    @InjectModel(Work.name) private readonly workModel: Model<WorkDocument>,
    private readonly questionHolderService: QuestionHoldersService,
    private readonly wordService: WordsService,
  ) { }

  findOne(userId: string | Types.ObjectId, bookId: string) {
    return this.workModel.findOne({ userId: userId, bookId: bookId })
  }

  create(createWorkDto: CreateWorkDto) {
    return this.workModel.create({ userId: createWorkDto.userId, bookId: createWorkDto.bookId, units: createWorkDto.units });
  }

  async findCurrentBookWorking(userId: Types.ObjectId | string, bookId: string) {
    try {
      const currentWorker = await this.workModel.findOne({ userId: userId, bookId: bookId });
      return currentWorker;
    }
    catch (e) {
      throw new InternalServerErrorException(e)
    }
  }
  async saveUserWork(user: UserDocument, lessonTree: LessonTree, workInfo: WorkInfo, results: Array<Result>): Promise<number> {
    try {
      const { bookId, unitId, levelIndex, lessonIndex } = lessonTree;
      const userWork = await this.workModel.findOne({ bookId: bookId, userId: user._id });
      const questionHolder = await this.questionHolderService.findOne(bookId, unitId);
      const userUnitWorkIndex = userWork.units.findIndex(work => work.unitId === unitId);
      if (userUnitWorkIndex == -1) {
        const userUnit: UnitWork = {
          incorrectList: [],
          unitId: lessonTree.unitId,
          levels: [
            {
              levelIndex: lessonTree.levelIndex,
              lessons: [
                {
                  lessonIndex: lessonTree.lessonIndex,
                  works: []
                }
              ]
            }
          ],
          didList: [],
        }
        userWork.units.push(userUnit);
      } else if (userUnitWorkIndex !== -1) {
        const userUnitWork = userWork.units[userUnitWorkIndex];
        const userLevelWorkIndex = userUnitWork.levels.findIndex(val => val.levelIndex === levelIndex);
        if (userLevelWorkIndex === -1) {
          const newUserLevelWork: LevelWork = {
            levelIndex: lessonTree.levelIndex,
            lessons: [{ lessonIndex: lessonIndex, works: [] }]
          };
          userWork.units[userUnitWorkIndex].levels.push(newUserLevelWork);
        }
        else {
          const userLevelWork = userUnitWork.levels[userLevelWorkIndex];
          const userLessonWorkIndex = userLevelWork.lessons.findIndex(val => val.lessonIndex === lessonIndex);
          if (userLessonWorkIndex === -1) {
            userWork.units[userUnitWorkIndex].levels[userLevelWorkIndex]
              .lessons.push({ lessonIndex: lessonIndex, works: [] });
          }
        }
      }
      const userUnitWork = userWork.units.find(val => val.unitId === unitId);
      const incorrectList = userUnitWork.incorrectList;
      const didList = userUnitWork.didList;
      let questionPoint = 0;
      if (results.length !== 0) {
        for (let i = 0; i < results.length; i++) {
          if (!results[i])
            continue;
          const question = questionHolder.questions.find(val => val._id === results[i]._id);
          if (!question) {
            questionPoint += 1;
            continue;
          }
          const isExist = incorrectList.find(val => val === results[i]._id);
          const check = await this.wordService.checkAnswer(results[i], question);
          if (check === true) {
            if (isExist && lessonTree.levelIndex == 5) {
              didList.push(results[i]._id);
            }
            questionPoint += this.questionHolderService.getQuestionPoint(question);
            results[i].status = true;
          } else {
            if (!isExist)
              incorrectList.push(results[i]._id);
            results[i].status = false;
          }
        }
      }
      userUnitWork.levels[levelIndex].lessons[lessonIndex]
        .works.push({ results: results, timeStart: workInfo.timeStart, timeEnd: workInfo.timeEnd });
      await userWork.save();
      let bonusStreak = 0;
      const streak = user.streak;
      if (streak == 0)
        bonusStreak = 0;
      else if (streak == 1)
        bonusStreak = 0.25;
      else if (streak == 2)
        bonusStreak = 0.5;
      else if (streak >= 3)
        bonusStreak = 1;
      else if (streak <= 5)
        bonusStreak = 1.5;
      else if (streak <= 10)
        bonusStreak = 2;
      else if (streak <= 15)
        bonusStreak = 2.5;
      else if (streak <= 20)
        bonusStreak = 2.75;
      else
        bonusStreak = 3;

      const accuracy = lessonTree.lessonTotalQuestions / workInfo.doneQuestions;
      questionPoint = Number.isNaN(accuracy) ? questionPoint : questionPoint * accuracy;
      const bonusLevel = lessonTree.levelIndex;
      const bonusLesson = lessonTree.lessonIndex / 2;
      return Number.isNaN(Math.floor(questionPoint + bonusLevel + bonusStreak + bonusLesson)) ? 0 :
      Math.floor(questionPoint + bonusLevel + bonusStreak + bonusLesson);
    }
    catch (e) {
      throw new InternalServerErrorException(e)
    }
  }
}
