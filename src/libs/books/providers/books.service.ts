import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Book, BookDocument } from "@entities/book.entity";
import { Model } from "mongoose";
import { ProgressesService } from "@libs/progresses/progresses.service";
import { BookGrade, GetLessonInput, GetLessonOutput, LessonTree } from "@dto/book";
import { BooksHelper } from "@helpers/books.helper";
import { WorksService } from "@libs/works/works.service";
import { ActiveBookProgress, ProgressBook, ProgressBookMapping } from "@dto/progress";
import { QuestionHoldersService } from "@libs/questionHolders/providers/questionHolders.service";
import { LessonDocument } from "@entities/lesson.entity";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { UnitLevel } from "@dto/unit";
import { booksName } from "@utils/constants";
import { Unit } from "@dto/unit/unit.dto";
import { WordDocument } from "@entities/word.entity";
import { SentenceDocument } from "@entities/sentence.entity";
import { WordsService } from "@libs/words/words.service";
import { SentencesService } from "@libs/sentences/sentences.service";
import { WordInLesson } from "@dto/word/wordInLesson.dto";

@Injectable()
export class BooksService {

    constructor(
        @InjectModel(Book.name) private bookModel: Model<BookDocument>,
        @Inject(forwardRef(() => ProgressesService)) private progressesService: ProgressesService,
        private worksService: WorksService,
        private wordsService: WordsService,
        private sentencesService: SentencesService,
        private booksHelper: BooksHelper,
        private questionHoldersService: QuestionHoldersService
    ) { }

    public findBookWithProgressBook(book: Partial<ProgressBook>): Observable<ActiveBookProgress> {
        const unSelect = ['name', 'grade', 'cover', '-_id']
        const book$ = from(
            this.bookModel
                .findById(book.bookId)
                .select(unSelect)
        )
            .pipe(
                map((result) => {

                    return {
                        name: result.name,
                        grade: result.grade,
                        cover: result.cover,
                        bookId: book.bookId,
                        doneLessons: book.doneLessons,
                        totalLessons: book.totalLessons,
                        lastDid: book.lastDid,
                        units: book.units

                    }
                })
            )


        return book$;
    }

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
                if (questionsForLatestLesson.length < 7) {
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
            lesson: { ...lesson.toJSON(), questions: reducingOutput.listQuestions },
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
            let totalLessonInUnit = 0;
            levels.map(level => { totalLessonInUnit += level.lessons.length });

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
    public async importBook(rows: string[][]): Promise<void> {
        for (let i = 1; i < rows.length; i++) {
            if (!booksName.includes(rows[i][5])) continue;
            try {
                await this.bookModel.create({
                    _id: this.booksHelper.getID(rows[i][5]),
                    nId: Number(rows[i][1]),
                    key: rows[i][0],
                    cover: rows[i][2],
                    description: rows[i][3],
                    grade: Number(rows[i][4]),
                    name: rows[i][5],
                    number: Number(rows[i][9]),
                    imgName: rows[i][6],
                    totalLessons: 0,
                    totalQuestions: 0,
                    totalSentences: 0,
                    totalWords: 0,
                    units: [],
                });
            } catch (e) {
                console.log(e);
            }
        }
    }

    public async isExist(): Promise<Boolean> {
        const book = await this.bookModel.findOne({});
        return book ? true : false;
    }
    public async updateBook(nId: number, unit: Unit | Unit[]): Promise<void> {
        try {
            let update = {};
            const filter = { nId: nId };
            update = {
                $inc: { totalUnits: 1 },
                $push: { units: unit },
            }
            if (Array.isArray(unit)) {
                update = {
                    $inc: { totalUnits: unit.length },
                    $push: { units: { $each: unit } },
                }
            }
            await this.bookModel.updateOne(filter, update);
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
    public async mapRangeToWords(
        words: WordInLesson[],
        sentences: SentenceDocument[],
        ranges: Array<number>,
        minSize: number,
        info: string[],
        prefix: number,
        unitImages: any,
        bookName: string
    ): Promise<Unit[]> {
        const prefixNormal = `https://s.saokhuee.com/lingo/anhunit/${bookName}/normal/`;
        const prefixBlue = `https://s.saokhuee.com/lingo/anhunit/${bookName}/blue/`;
        const remainder = words.length % minSize;
        const unitNId = Number(info[1]);
        const _id = this.booksHelper.getID(info[4]);
        const unitIndex = Number(info[7]);
        const listUnits: Array<Unit> = [];
        const totalUnits = Math.floor(words.length / minSize)
        for (let index = 0; index < ranges.length; index++) {
            const range = ranges[index];
            let start: number;
            let end: number;
            if (range !== minSize) {
                start = index * range;
                end = (index + 1) * range;
            } else {
                start = index * range + remainder;
                end = (index + 1) * range + remainder;
            }
            const wordIds = words.slice(start, end).map((w) => w._id);
            const sentenceIds = sentences
                .filter((s) => wordIds.includes(s.baseId))
                .map((s) => s._id);
           // const changedUnitNId = unitNId * 100 + index;
            const unit: Unit = {
                _id: `${_id}${index + 1}`,
                nId: unitNId * 100 + index,
                unitIndex: unitIndex * 100 + index,
                key: `${info[0]}${index}`,
                name: `U${prefix}. ${info[4]} (${index + 1}/${totalUnits})`,
                description: info[3],
                grammar: info[5],
                tips: info[6],
                wordIds: wordIds,
                sentenceIds: sentenceIds,
                normalImage: unitImages && unitImages?.normal ? prefixNormal + unitImages.normal : '',
                blueImage: unitImages && unitImages?.blue ? prefixBlue + unitImages.blue : '',
                totalLessons: 0,
                totalLevels: 0,
                levels: [],
                totalQuestions: 0,
            };
            listUnits.push(unit);
            await Promise.all([
                this.wordsService.updateWords(wordIds, unit.nId),
                this.sentencesService.updateSentences(sentenceIds, unit.nId)
            ]);
        }
        return listUnits;
    }

}