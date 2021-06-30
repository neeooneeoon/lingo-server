import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Book, BookDocument } from "@entities/book.entity";
import { Model, Types } from "mongoose";
import { ProgressesService } from "@libs/progresses/progresses.service";
import { BookGrade, GetLessonInput, GetLessonOutput, LessonTree } from "@dto/book";
import { BooksHelper } from "@helpers/books.helper";
import { WorksService } from "@libs/works/works.service";
import { ProgressBookMapping } from "@dto/progress";
import { QuestionHoldersService } from "@libs/questionHolders/providers/questionHolders.service";
import { LessonDocument } from "@entities/lesson.entity";

@Injectable()
export class BooksService {

    constructor(
        @InjectModel(Book.name) private bookModel: Model<BookDocument>,
        private progressesService: ProgressesService,
        private worksService: WorksService,
        private booksHelper: BooksHelper,
        private questionHoldersService: QuestionHoldersService
    ) { }

    public async getBook(bookId: string): Promise<BookDocument> {
        try {
            const book = await this.bookModel.findById(bookId);
            if (!book) {
                throw new BadRequestException(`Can't find book ${bookId}`);
            }
            return book;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async getBooksByGrade(grade: number, userId: string): Promise<BookGrade[]> {
        try {
            const books = (await this.bookModel.find({ grade: grade }))
                .sort((bookOne, bookTwo) => bookOne.nId - bookTwo.nId);
            let userProgress = await this.progressesService.getUserProgress(userId);
            if (!userProgress) {
                userProgress = await this.progressesService.createUserProgress({ userId: userId, books: [] });
            }
            const booksGrade: BookGrade[] = books.map(book => {
                const progressBook = userProgress.books.find(item => item.bookId === book._id);
                return this.booksHelper.mapToBookGrade(book, progressBook);
            });
            return booksGrade;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }


    public async getUnitsInBook(bookId: string, userId: string): Promise<ProgressBookMapping> {
        try {
            const book = await this.getBook(bookId);
            const instanceUserWork = await this.worksService.getUserWork(userId, bookId);
            if (!instanceUserWork) {
                await this.worksService.createUserWork(userId, bookId);
            }
            const bookProgress = await this.progressesService.getBookProgress(userId, book);
            return bookProgress;
            
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async getDetailLesson(userId: string, input: GetLessonInput): Promise<GetLessonOutput> {
        const {
            bookId,
            unitId,
            levelIndex,
            lessonIndex
        } = input;
        const book = await this.getBook(bookId);
        const units = book.units;
        if (!units || units.length == 0) {
            throw new BadRequestException(`No unit in book ${bookId}`);
        }
        const unit = units.find(item => item._id == unitId);
        if (!unit) {
            throw new BadRequestException(`No unit ${unit} in book ${bookId}`);
        }
        const levels = unit.levels;
        if (!levels || levels.length == 0) {
            throw new BadRequestException(`No level in unit ${unitId}`);
        }
        const level = levels.find(item => item.levelIndex === levelIndex);
        if (!level) {
            throw new BadRequestException(`No level ${levelIndex} in unit ${unitId}`);
        }

        const lessons = level.lessons;
        if (!lessons || lessons.length == 0) {
            throw new BadRequestException(`No lessons in level index ${levelIndex}`);
        }
        let lesson: LessonDocument;
        if (levelIndex == levels.length - 1 && lessonIndex == lessons.length) {
            lesson = lessons[lessons.length - 1];
        }
        else {
            lesson = lessons.find(item => item.lessonIndex === lessonIndex);
        }
        if (!lesson) {
            throw new BadRequestException(`Can't find lesson ${lessonIndex}`);
        }

        const questionHolder = await this.questionHoldersService.getQuestionHolder({
            bookId: bookId,
            unitId: unitId,
            level: levelIndex
        });
        const questions = questionHolder?.questions;

        if (lesson?.questionIds?.length == 0 && questions.length !== 0) {
            const userWork = await this.worksService.getUserWork(userId, bookId);
            const userWorkUnit = userWork?.units?.find(item => item.unitId === unitId);
            if (lessonIndex === lessons.length - 1) {
                const userWorkLevel = userWorkUnit?.levels?.find(item => item.levelIndex === levelIndex);
                const incorrectList = userWorkLevel ? userWorkLevel.incorrectList : [];

                const incorrectPercent = Math.floor(incorrectList.length / questions.length) * 100;
                const questionsForLatestLesson = this.questionHoldersService.questionsLatestLesson(incorrectPercent, incorrectList, questions);
                lesson.questionIds = questionsForLatestLesson;
                if (questionsForLatestLesson.length === 0) {
                    const setIndexes = new Set<number>();
                    let counter = lesson.questionIds.length;
                    while (lesson.questionIds.length < 7 && counter < questions.length) {
                        const index = Math.floor(Math.random() * questions.length);
                        if (!setIndexes.has(index)) {
                            lesson.questionIds.push(String(questions[index]._id));
                            setIndexes.add(index);
                            counter++;
                        }
                    }
                }
            }
            else {
                const incorrectList = userWorkUnit?.incorrectList;
                const didList = userWorkUnit?.didList;
                const leftOver = incorrectList.filter(q => didList.indexOf(q) === -1);
                if (leftOver.length <= 7) {
                    lesson.questionIds.push(...leftOver);
                }
                else {
                    const leftOverLength = leftOver.length;
                    const setIndexes = new Set<number>();
                    while (lesson.questionIds.length < 7) {
                        const index = Math.floor(Math.random() * leftOverLength);
                        if (!setIndexes.has(index)) {
                            lesson.questionIds.push(leftOver[index]);
                            setIndexes.add(index);
                        }
                    }
                }
                const setIndexes = new Set<number>();
                let counter = lesson.questionIds.length;

                while (lesson.questionIds.length < 10 && counter < questions.length) {
                    const index = Math.floor(Math.random() * questions.length);
                    if (!setIndexes.has(index)) {
                        lesson.questionIds.push(String(questions[index]._id));
                        setIndexes.add(index);
                        counter++;
                    }
                }
            }
        }
        const reducingOutput = await this.questionHoldersService.reduceByQuestionIds({
            currentUnit: unit,
            questions: questions,
            listAskingQuestionIds: lesson.questionIds
        });
        
        return {
            lesson: {...lesson.toJSON(), questions: reducingOutput.listQuestions},
            words: reducingOutput.wordsInLesson,
            sentences: reducingOutput.sentencesInLesson,
        }
    }

    public async getLessonTree(input: GetLessonInput): Promise<LessonTree> {
        try {
            const {
                bookId,
                unitId,
                levelIndex,
                lessonIndex
            } = input;
            let isLastLesson = false;

            const book = await this.getBook(bookId);
            const units = book.units;
            if (!units || units.length === 0) {
                throw new BadRequestException(`No unit in book ${bookId}`);
            }
            const unit = units.find(item => item._id === unitId);
            if (!unit) {
                throw new BadRequestException(`Can't find unit ${unitId}`);
            }
            const levels = unit.levels;
            if (!levels || levels.length === 0) {
                throw new BadRequestException(`No level in unit ${unitId}`);
            }
            const level = levels.find(item => item.levelIndex === levelIndex);
            if (!level) {
                throw new BadRequestException(`Can't find level ${levelIndex}`);
            }
            const lessons = level.lessons;
            if (!lessons || lessons.length === 0) {
                throw new BadRequestException(`No lesson in ${levelIndex}`);
            }
            let lesson: LessonDocument;
            if (levelIndex == unit.levels.length - 1 && lessonIndex == lessons.length) {
                isLastLesson = true;
                lesson = lessons[lessons.length - 1];
            }
            else {
                lesson = lessons.find(item => item.lessonIndex === lessonIndex);
            }
            if (!lesson) {
                throw new BadRequestException(`Can't find lesson ${lessonIndex}`);
            }
            return {
                isLastLesson: isLastLesson,
                grade: book.grade,
                bookId: book._id,
                unitId: unit._id,
                levelIndex: levelIndex,
                lessonIndex: lessonIndex,
                unitTotalLevels: unit.levels.length,
                levelTotalLessons: level.lessons.length,
                lessonTotalQuestions: lesson.totalQuestions,
                book: book
            }
            
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

}