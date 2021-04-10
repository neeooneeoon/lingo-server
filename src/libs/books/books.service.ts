import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateBookDto } from './dto/create-book.dto';
import { Book, BookDocument } from './schema/book.schema';
import { Model, Types } from 'mongoose';
import { ProgressesService } from 'src/libs/progresses/progresses.service';
import { WorksService } from 'src/libs/works/works.service';
import { GetLessonsByUnitInput } from './dto/lesson-by-unit.dto';
import { Lesson } from 'src/libs/units/schema/unit.schema';
import { QuestionHoldersService } from 'src/libs/question-holders/question-holders.service';
import { WordDocument } from '../words/schema/word.schema';
import { SentenceDocument } from '../sentences/schema/sentence.schema';
import { SentencesService } from '../sentences/sentences.service';
import { WordsService } from '../words/words.service';
import { BookByGradeResponse } from './dto/book-by-grade.dto';
import { getQuestionOutPut } from 'src/helper/helper';
import { RequestLesson } from './dto/request-lesson.dto';
import { LessonTree } from './dto/lesson-tree.dto';
import { ResultMappingHelper } from 'src/helper/resultMapping.helper';
@Injectable()
export class BooksService {

  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
    private readonly progressService: ProgressesService,
    private readonly workService: WorksService,
    private readonly questionHolderService: QuestionHoldersService,
    private readonly sentenceService: SentencesService,
    private readonly wordService: WordsService,
    private readonly resultMapping: ResultMappingHelper
  ) { }

  async findAll(): Promise<BookDocument[]> {
    try {
      const data = await this.bookModel.aggregate([{ "$group": { _id: "$grade", books: { $push: "$_id" } } }])
      return data;
    }
    catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  async findOne(id: string): Promise<BookDocument> {
    try {
      const book = await this.bookModel.findById(id);
      if (book) {
        return book;
      }
      else {
        throw new HttpException("Book Not Found", HttpStatus.BAD_REQUEST);
      }
    }
    catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  async getBooksByGrade(grade: number, userId: Types.ObjectId): Promise<BookByGradeResponse[]> {
    try {
      const books = await this.bookModel.find({ grade: grade })
      let userProgress = await this.progressService.findProgressByUserId(userId);
      if (!userProgress) {
        userProgress = await this.progressService.create({ userId: userId, books: [] });
      }
      const booksLatestResult = books.map(book => {
        const bookProgress = userProgress.books.find(bookProgress => bookProgress.bookId === book._id);
        return {
          _id: book._id,
          name: book.name,
          grade: book.grade,
          cover: book.cover,
          totalWords: book.totalWords,
          totalUnits: book.totalUnits,
          description: book.description,
          totalQuestions: book.totalQuestions,
          totalLessons: book.totalLessons,
          doneLessons: bookProgress ?
            (bookProgress.doneLessons > book.totalLessons ? book.totalLessons : bookProgress.doneLessons) : 0,
          doneQuestions: bookProgress ?
            (bookProgress.doneQuestions > book.totalQuestions ? book.totalQuestions : bookProgress.doneQuestions) : 0,
        }
      })
      return booksLatestResult;
    }
    catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  async getUnitsByBookId(userId: string, bookId: string) {
    try {
      const book = await this.bookModel.findById(bookId);
      if (!book) {
        throw new HttpException("Cant not found book", HttpStatus.NOT_FOUND);
      }
      else {
        const currentBookWorker = await this.workService.findCurrentBookWorking(userId, bookId);
        if (!currentBookWorker) {
          await this.workService.create({ userId: userId, bookId: bookId, units: [] });
        }
        const userBookProgress = await this.progressService.getBookProgress(userId, book);
        return userBookProgress;
      }
    }
    catch (e) {
      throw new InternalServerErrorException(e)
    }
  }
  async getLessonsByUnit(userId: Types.ObjectId | string, request: GetLessonsByUnitInput) {
    try {
      const book = await this.bookModel.findById(request.bookId);
      if (!book) {
        throw new HttpException("Book can not found", HttpStatus.BAD_REQUEST);
      }
      const unit = book.units.find(item => item._id == request.unitId);
      if (!unit) {
        throw new HttpException("Unit cant not found", HttpStatus.BAD_REQUEST);
      }
      const level = unit.levels.find(item => item.levelIndex == request.levelIndex);
      if (!level) {
        throw new HttpException("Level can not found", HttpStatus.BAD_REQUEST);
      }
      let lesson: Lesson;
      if (request.levelIndex === unit.levels.length - 1 && request.lessonIndex === level.lessons.length) {
        lesson = level.lessons[level.lessons.length - 1];
      }
      else {
        lesson = level.lessons[request.lessonIndex];
        if (!lesson) {
          const path = `${request.bookId}/${request.unitId}/${request.levelIndex}/${request.lessonIndex}`;
          throw new Error(`Can't find lesson: ${path}`);
        }
      }
      const questionHolder = await this.questionHolderService.findOne(request.bookId, request.unitId, request.levelIndex);
      const questions = questionHolder.questions;

      if (lesson.questionIds.length == 0) {
        const userWork = await this.workService.findOne(userId, request.bookId);
        const userUnit = userWork.units.find(val => val.unitId === request.unitId);

        if (userUnit.levels[userUnit.levels.length - 1].levelIndex !== level.levelIndex) {
          const userLevel = userUnit.levels.find(val => val.levelIndex === level.levelIndex);
          const levelIncorrectList = userLevel.incorrectList;

          const incorrectPercent = Math.floor(levelIncorrectList.length / questions.length) * 100;
          if (incorrectPercent < 20) {
            lesson.questionIds = questions.filter(question => question.rank === 4)
              .sort(() => 0.5 - Math.random()).slice(0, 10).map(question => question._id);
          } else if (incorrectPercent >= 20 && incorrectPercent < 40) {
            lesson.questionIds = questions.filter(question => question.rank < 4 && question.rank > 1)
              .sort(() => 0.5 - Math.random()).slice(0, 10).map(question => question._id);
          } else if (incorrectPercent >= 40) {
            lesson.questionIds = questions.filter(question => question.rank === 1)
              .sort(() => 0.5 - Math.random()).slice(0, 10).map(question => question._id);
          }
          else {
            const unitIncorrectList = userUnit.incorrectList;
            const didList = userUnit.didList;
            const leftOver = unitIncorrectList.filter(q => didList.indexOf(q) === -1);
            if (leftOver.length <= 7) {
              lesson.questionIds.push(...leftOver);
            } else {
              const incorrectIndexes: number[] = [];
              while (incorrectIndexes.length < 7) {
                const index = Math.floor(Math.random() * leftOver.length);
                if (!incorrectIndexes.includes(index)) {
                  lesson.questionIds.push(leftOver[index]);
                  incorrectIndexes.push(index);
                }
              }
            }
          }
          const indexes: number[] = [];
          while (lesson.questionIds.length < 12) {
            const index = Math.floor(Math.random() * questions.length);
            if (!indexes.includes(index)) {
              lesson.questionIds.push(questions[index]._id);
              indexes.push(index);
            }
          }
          lesson.questionIds = lesson.questionIds.sort(() => 0.5 - Math.random());
        }
      }
      const wordIds: Set<string> = new Set(unit.wordIds);
      const sentenceIds: Set<string> = new Set(unit.sentenceIds);
      const words: WordDocument[] = [];
      const sentences: SentenceDocument[] = [];
      const indexes: number[] = [];

      for (let questionIdIndex = 0; questionIdIndex < lesson.questionIds.length; questionIdIndex++) {
        const question = questions.find(q => q._id == lesson.questionIds[questionIdIndex]);
        if (question && question.group == "word") {
          if (question.focus !== "")
            wordIds.add(question.focus);
          for (const choice of question.choices) {
            if (choice != "ERROR" && !choice.includes("@")) {
              wordIds.add(choice);
              indexes.push(questionIdIndex);
            }
          }
        } else if (question && question.group !== "word") {
          sentenceIds.add(question.focus);
          for (const choice of question.choices) {
            if (choice != "ERROR" && !choice.includes("@")) {
              sentenceIds.add(choice);
              indexes.push(questionIdIndex);
            }
          }
        }
      }
      words.push(...await this.wordService.findWords(wordIds));
      sentences.push(...await this.sentenceService.findSentences(sentenceIds));

      const missed = await this.wordService.getMissedSpelling(book.nId, unit.nId) as unknown as Partial<WordDocument>[]
      const resultWords = words.map(word => this.resultMapping.mapWordToLessonData(word));
      const resultSentences = sentences.map(sentence => this.resultMapping.mapSentenceToLessonData(sentence));
      for (let questionIdIndex = 0; questionIdIndex < lesson.questionIds.length; questionIdIndex++) {
        const question = questions.find(q => q._id == lesson.questionIds[questionIdIndex]);
        if (question) {
          if (indexes.includes(questionIdIndex)) {
            if (question && question.group == "word") {
              const word = words.find(word => word._id == question.focus);
              const { choices, errorWords } = this.wordService.createFakeWords(question._id, word, question.choices);
              question.choices = choices;
              resultWords.push(...errorWords);
            }
            else if (question && question.group !== "word"){
              if (question.type == 7) {
                const sentence = sentences.find(sentence => sentence._id == question.focus);
                question.choices = this.wordService.createFakeWordContent(question, sentence, words.map(word => word.content));
              }
              else if (question.type == 10) {
                const sentence = sentences.find(sentence => sentence._id == question.focus);
                const { choices, errorSentences }
                  = this.sentenceService.createFakeSentences(question._id, sentence, words, question.choices);
                question.choices = choices;
                resultSentences.push(...errorSentences);
              }
            }
          }
          lesson.questions.push(getQuestionOutPut(question));
        }
      }
      return {
        lesson: lesson,
        words: [...resultWords, ...missed],
        sentences: resultSentences,
      };
    }
    catch (e) {
      throw new InternalServerErrorException(e)
    }
  }

  async getLessonTree(request: RequestLesson): Promise<LessonTree> {
    try {
      const book = await this.bookModel.findById(request.bookId);
      let checkIsLastLesson = false;

      if (!book) {
        throw new BadRequestException("Can not find book");
      }
      const unit = book.units.find(unit => unit._id === request.unitId);
      if (!unit) {
        throw new BadRequestException("Cant not find unit");
      }
      const level = unit.levels.find(level => level.levelIndex === request.levelIndex)
      if (!level) {
        throw new BadRequestException("Can not find level");
      }
      let lesson: Lesson;
      if (request.levelIndex && request.levelIndex === unit.levels.length - 1 && request.lessonIndex === level.lessons.length) {
        checkIsLastLesson = true;
        lesson = level.lessons[level.lessons.length - 1];
        if (!lesson) {
          const path = `${request.bookId}/${request.unitId}/${request.levelIndex}/${request.lessonIndex}`;
          throw new Error(`Can't find lesson: ${path}`);
        }
      }
      else {
        lesson = level.lessons[request.lessonIndex];
      }
      return {
        isLastLesson: checkIsLastLesson,
        grade: book.grade,
        bookId: book._id,
        unitId: unit._id,
        levelIndex: level.levelIndex,
        lessonIndex: lesson?.lessonIndex,
        unitTotalLevels: unit.levels.length,
        levelTotalLessons: level.lessons.length,
        lessonTotalQuestions: lesson.totalQuestions,
      }
    }
    catch (e) {
      throw new InternalServerErrorException(e)
    }
  }
}
