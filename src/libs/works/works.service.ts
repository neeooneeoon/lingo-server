import { Model, Types } from 'mongoose';
import { Work, WorkDocument } from "@entities/work.entity";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { QuestionDocument } from '@entities/question.entity';
import { QuestionHoldersService } from '@libs/questionHolders/questionHolders.service';
import { UserDocument } from '@entities/user.entity';
import { LessonTree } from '@dto/book';
import { AnswerResult } from '@dto/lesson';
import { LevelWork, UnitWork, WorkInfo } from '@dto/works';
import { QuestionHolderDocument } from '@entities/questionHolder.entity';

@Injectable()
export class WorksService {
    
    constructor(
        @InjectModel(Work.name) private workModel: Model<WorkDocument>,
        private questionHoldersService: QuestionHoldersService,
    ) { }

    public async createUserWork(userId: Types.ObjectId | string, bookId: string): Promise<void> {
        try {
            const userWork = await this.workModel.findOne({
                userId: userId,
                bookId: bookId
            });
            if (!userWork) {
                await this.workModel.create({
                    userId: userId,
                    bookId: bookId,
                    units: []
                });
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async getUserWork(userId: string | Types.ObjectId, bookId: string): Promise<WorkDocument> {
        try {
            const userWork = await this.workModel.findOne({
                bookId: bookId,
                userId: userId
            });
            if (!userWork) {
                throw new BadRequestException(`Can't not find user-work ${userId}-${bookId}`);
            }
            return userWork;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public questionsLatestLesson(
        incorrectPercent: number,
        incorrectList: string[],
        rootQuestions: QuestionDocument[]
        ): Array<string> {
        if (incorrectPercent < 20) {
            return [];
        }
        else if (incorrectPercent < 40) {
            const mediumQuestions = rootQuestions
                .filter(q => q.rank == 2 || q.rank == 3)
                .sort(() => 0.5 - Math.random())
                .map(q => String(q._id));
            return [...incorrectList, ...mediumQuestions].slice(0, 10);
        }
        else {
            const hardQuestions = rootQuestions
                .filter(q => q.rank == 1 || q.rank == 4)
                .sort(() => 0.5 - Math.random())
                .map(q => String(q._id))
            return [...incorrectList, ...hardQuestions].slice(0, 10);
        }
    }

    public async getUnitWork(userWork: WorkDocument, unitId: string) {
        const index = userWork.units.findIndex(item => item.unitId === unitId);

    }

    public async saveUserWork(user: UserDocument, lessonTree: LessonTree, workInfo: WorkInfo, results: AnswerResult[]):  Promise<number> {
        try {
            const {
                bookId,
                unitId,
                levelIndex,
                lessonIndex,
            } = lessonTree;

            const userWorkPromise = this.getUserWork(user._id, bookId);
            const questionHolderPromise = this.questionHoldersService.getQuestionHolder({
                bookId: bookId,
                unitId: unitId,
                level: levelIndex
            });
            let userWork: WorkDocument;
            let questionHolder: QuestionHolderDocument;
            await Promise.all([userWorkPromise, questionHolderPromise])
                .then(([userWorkResult, questionHolderResult]) =>{
                    userWork = userWorkResult;
                    questionHolder = questionHolderResult;
                })
                .catch(error => {
                    throw new InternalServerErrorException(error);
                });
            let unitIndex = userWork.units.findIndex(item => item.unitId === unitId);
            let levelWorkIndex: number = 0;

            if (unitIndex === -1) {
                const newUnit: UnitWork = {
                    unitId: unitId,
                    levels: [{
                        levelIndex: levelIndex,
                        lessons: [{
                            lessonIndex: lessonIndex,
                            works: []
                        }],
                        incorrectList: []
                    }],
                    incorrectList: [],
                    didList: []
                };
                userWork.units.push(newUnit);
                unitIndex = userWork.units.length - 1;
            }
            else {
                const unitWork = userWork.units[unitIndex];
                levelWorkIndex = unitWork.levels.findIndex(item => item.levelIndex === levelIndex);
                if (levelWorkIndex === -1) {
                    const newLevelWork: LevelWork = {
                        levelIndex: levelIndex,
                        lessons: [{
                            lessonIndex: lessonIndex,
                            works: []
                        }],
                        incorrectList: []
                    };
                    userWork.units[unitIndex].levels.push(newLevelWork);
                    levelWorkIndex = userWork.units[unitIndex].levels.length - 1;
                }
                else {
                    const levelWork = unitWork.levels[levelWorkIndex];
                    const lessonWorkIndex = levelWork.lessons.findIndex(item => item.lessonIndex === lessonIndex);
                    if (lessonWorkIndex === -1) {
                        userWork.units[unitIndex].levels[levelWorkIndex].lessons.push({
                            lessonIndex: lessonIndex,
                            works: []
                        });
                    }
                }
            }
            const unitWork = userWork.units[unitIndex];
            const unitIncorrectList = unitWork.incorrectList;
            const didList = unitWork.didList;
            const levelWork = unitWork.levels[levelWorkIndex];
            const levelIncorrectList = levelWork.incorrectList;

            let questionPoint = 0;
            if (results.length > 0) {
                
            }
            /**
             * Continue
             */
            return 1;

        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}