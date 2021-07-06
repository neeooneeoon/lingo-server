import { Model, Types } from 'mongoose';
import { Progress, ProgressDocument } from "@entities/progress.entity";
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CreateUserProgressDto } from '@dto/progress/createProgress.dto';
import { BookDocument } from '@entities/book.entity';
import { ProgressUnitMapping, ProgressBookMapping, ProgressBook, ProgressUnit, ProgressLevel, ActiveBookProgress } from "@dto/progress";
import { ProgressesHelper } from '@helpers/progresses.helper';
import { LessonTree } from '@dto/book';
import { WorkInfo } from '@dto/works';
import { forkJoin, from, Observable, of } from 'rxjs';
import {map, switchMap } from 'rxjs/operators';
import { BooksService } from '@libs/books/providers/books.service';

@Injectable()
export class ProgressesService {
    constructor(
        @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
        private progressesHelper: ProgressesHelper,
        @Inject(forwardRef(() => BooksService)) private booksService: BooksService,

    ) { }

    async createUserProgress(input: CreateUserProgressDto): Promise<ProgressDocument> {
        const { userId, books } = input;
        return this.progressModel.create({
            userId: Types.ObjectId(String(userId)),
            books: books,
        });
    }

    async getUserProgress(userId: string): Promise<ProgressDocument> {
        return this.progressModel.findOne({ userId: Types.ObjectId(userId) });
    }

    async getBookProgress(
        userId: string, book: BookDocument
    ): Promise<ProgressBookMapping> {
        let userProgress = await this.getUserProgress(userId);
        if (!userProgress) {
            userProgress = await this.createUserProgress({
                userId: Types.ObjectId(userId),
                books: []
            });
        }
        let bookProgress = userProgress.books.find(item => item.bookId === book._id);
        if (!bookProgress) {
            bookProgress = {
                totalLessons: book.totalLessons,
                doneLessons: 0,
                bookId: book._id,
                totalUnits: book.units.length,
                doneQuestions: 0,
                correctQuestions: 0,
                units: [],
                score: 0,
                level: 0,
                lastDid: new Date()
            };
            userProgress.books.push(bookProgress);
            await userProgress.save();
        }

        const mappedUnits: ProgressUnitMapping[] = book.units.map(unit => {
            if (unit) {
                const unitProgress = bookProgress.units.find(unitProgress => unitProgress.unitId === unit._id);
                return this.progressesHelper.combineUnitAndProgressUnit(unit, unitProgress);
            }
        }).filter(unit => unit);
        return this.progressesHelper.combineBookAndProgressBook(book, bookProgress, mappedUnits)
    }

    public async saveUserProgress(userId: string, lessonTree: LessonTree, workInfo: WorkInfo): Promise<boolean> {
        try {
            let hasLesson = false;
            let result = false;
            const {
                bookId,
                book,
                unitId,
                unitTotalLevels,
                lessonTotalQuestions,
                levelIndex,
                levelTotalLessons,
                lessonIndex,
                isLastLesson,
            } = lessonTree;

            let userProgress = await this.getUserProgress(userId);
            if (!userProgress) {
                throw new BadRequestException(`Can't find progress user ${userId}`);
            }
            let progressBook = userProgress.books.find(item => item.bookId === bookId);
            if (!progressBook) {
                const newProgressBook: ProgressBook = {
                    bookId: bookId,
                    totalUnits: book.units.length,
                    score: 0,
                    level: 0,
                    doneQuestions: 0,
                    correctQuestions: 0,
                    totalLessons: book.totalLessons,
                    doneLessons: 0,
                    lastDid: new Date(),
                    units: []
                };
                userProgress.books.push(progressBook);
                progressBook = newProgressBook;
            }
            const unitInBook = book.units.find(unit => unit._id === unitId)
            let progressUnit = progressBook.units.find(item => item.unitId === lessonTree.unitId);
            if (!progressUnit) {
                const newProgressUnit: ProgressUnit = {
                    unitId: unitId,
                    totalLevels: unitTotalLevels,
                    passedLevels: 0,
                    doneLessons: 1,
                    doneQuestions: workInfo.doneQuestions,
                    correctQuestions: lessonTotalQuestions,
                    lastDid: workInfo.timeEnd,
                    normalImage: unitInBook?.normalImage,
                    blueImage: unitInBook?.blueImage,
                    levels: [{
                        levelIndex: levelIndex,
                        totalLessons: levelTotalLessons,
                        passed: levelTotalLessons === 1,
                        doneLessons: 1,
                        lessons: [lessonIndex]
                    }]
                };
                progressBook.units.push(newProgressUnit);
            }
            else {
                let progressLevel = progressUnit.levels.find(item => item.levelIndex === levelIndex);
                if (!progressLevel) {
                    const newProgressLevel: ProgressLevel = {
                        levelIndex: levelIndex,
                        totalLessons: levelTotalLessons,
                        doneLessons: 1,
                        passed: levelTotalLessons === 1,
                        lessons: [lessonIndex]
                    }
                    progressUnit.levels.push(newProgressLevel);
                }
                else {
                    const userLesson = progressLevel.lessons.find(item => Number(item) === Number(lessonIndex));
                    if (!userLesson) {
                        progressLevel.lessons.push(lessonIndex);
                        progressLevel.passed = progressLevel.lessons.length == progressLevel.totalLessons;
                        if (progressLevel.passed === true) {
                            progressUnit.passedLevels++;
                            progressBook.level++;
                            result = true;
                        }
                        progressLevel.doneLessons++;
                    }
                    if (userLesson) {
                        hasLesson = true;
                    }
                }
                progressUnit.correctQuestions += lessonTotalQuestions;
                progressUnit.lastDid = workInfo.timeEnd;

                if (!isLastLesson && !hasLesson) {
                    progressUnit.doneLessons++;
                    progressUnit.doneQuestions += workInfo.doneQuestions;
                }
            }
            progressBook.correctQuestions = + lessonTotalQuestions;
            progressBook.lastDid = workInfo.timeEnd;
            progressBook.score++;

            if (!isLastLesson && !hasLesson) {
                progressBook.doneLessons++;
                progressBook.doneQuestions += workInfo.doneQuestions;
            }
            await userProgress.save();
            return result;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public latestActiveBookProgress(userId: string): Observable<ActiveBookProgress[] | ProgressBook | any[]> {
        const unSelect = [
            '-books.totalUnits', '-books.units.levels',
            '-books.doneQuestions', '-books.correctQuestions',
            '-books.score', '-__v', '-books._id', '-books.level'
        ]
        const progress$ = from(
            this.progressModel
                .findOne({
                    userId: Types.ObjectId(userId)
                })
                .select(unSelect)
        )
            .pipe(
                map(progress => {
                    if (!progress) {
                        throw new BadRequestException(`Can't find progress with user ${userId}`);
                    }
                    return progress;
                })
            )
        const book$ = progress$.pipe(
            switchMap((r: ProgressDocument) => {
                const books = r.books;
                if (books.length > 0) {
                    const lastActiveBooks = books.sort((bookOne, bookTwo) => {
                        if (bookOne.lastDid < bookTwo.lastDid) return 1;
                        if (bookOne.lastDid > bookTwo.lastDid) return -1;
                        return 0;
                    });
                    return forkJoin(
                        lastActiveBooks.slice(0, 5).map((book: ProgressBook) => this.booksService.findBookWithProgressBook(book))
                    )
                }
                else {
                    return books;
                }
            }),
        )
        return book$
    }

}