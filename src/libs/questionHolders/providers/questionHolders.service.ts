import {
  QuestionHolder,
  QuestionHolderDocument,
} from '@entities/questionHolder.entity';
import { QuestionDocument } from '@entities/question.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GetQuestionHolderInput,
  QuestionReducingInput,
  QuestionReducingOutput,
} from '@dto/questionHolder';
import { WordsService } from '@libs/words/words.service';
import { SentencesService } from '@libs/sentences/sentences.service';
import { WordInLesson } from '@dto/word/wordInLesson.dto';
import { SentenceInLesson } from '@dto/sentence';
import {
  ListSentenceQuestionCodes,
  ListWorQuestionCodes,
  MultipleChoiceCode,
} from '@utils/constants';
import { QuestionsHelper } from '@helpers/questionsHelper';
import { Unit, UnitDocument } from '@entities/unit.entity';
import { WordDocument } from '@entities/word.entity';
import { SentenceDocument } from '@entities/sentence.entity';

@Injectable()
export class QuestionHoldersService {
  constructor(
    @InjectModel(QuestionHolder.name)
    private questionHolderModel: Model<QuestionHolderDocument>,
    @InjectModel(Unit.name) private unitModel: Model<UnitDocument>,
    private wordsService: WordsService,
    private sentencesService: SentencesService,
    private questionsHelper: QuestionsHelper,
  ) {}

  public async getQuestionHolder(
    input: GetQuestionHolderInput,
  ): Promise<QuestionHolderDocument> {
    try {
      const { bookId, unitId, level } = input;
      const questionHolder = await this.questionHolderModel.findOne({
        bookId: bookId,
        unitId: unitId,
        level: level,
      });
      if (!questionHolder) {
        throw new BadRequestException(
          `Can't not find question holder with ${input}`,
        );
      }
      return questionHolder;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async adminReduceQuestion(
    input: QuestionReducingInput,
  ): Promise<QuestionReducingOutput> {
    try {
      const { questions, listAskingQuestionIds, currentUnit } = input;

      const setWordIds: Set<string> = new Set<string>(currentUnit.wordIds);
      const setSentenceIds: Set<string> = new Set<string>(
        currentUnit.sentenceIds,
      );
      const listQuestions: any[] = [];

      for (const questionId of listAskingQuestionIds) {
        const inspectedQuestion = questions.find(
          (question) => question._id == questionId,
        );
        if (inspectedQuestion) {
          const {
            code: questionCode,
            choices,
            focus: baseQuestionId,
          } = inspectedQuestion;
          if (ListWorQuestionCodes.includes(questionCode)) {
            baseQuestionId ? setWordIds.add(baseQuestionId) : null;
            for (const choice of choices) {
              setWordIds.add(choice._id);
            }
          } else if (ListSentenceQuestionCodes.includes(questionCode)) {
            baseQuestionId ? setSentenceIds.add(baseQuestionId) : null;
            for (const choice of choices) {
              setSentenceIds.add(choice._id);
            }
          }
          const questionOutput =
            this.questionsHelper.getDetailQuestionOutput(inspectedQuestion);
          listQuestions.push(questionOutput);
        }
      }

      const wordsInLessonPromise = this.wordsService.findByIds([...setWordIds]);
      const sentencesInLessonPromise = this.sentencesService.findByIds([
        ...setSentenceIds,
      ]);
      let wordsInLesson: WordInLesson[] = [];
      let sentencesInLesson: SentenceInLesson[] = [];

      await Promise.all([wordsInLessonPromise, sentencesInLessonPromise])
        .then(([wordsResult, sentencesResult]) => {
          wordsInLesson = wordsResult;
          sentencesInLesson = sentencesResult;
        })
        .catch((error) => {
          throw new InternalServerErrorException(error);
        });

      return {
        wordsInLesson: wordsInLesson,
        sentencesInLesson: sentencesInLesson,
        listQuestions: listQuestions,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async reduceByQuestionIds(
    input: QuestionReducingInput,
  ): Promise<QuestionReducingOutput> {
    try {
      const { questions, listAskingQuestionIds, currentUnit } = input;

      const setWordIds: Set<string> = new Set<string>(currentUnit.wordIds);
      const setSentenceIds: Set<string> = new Set<string>(
        currentUnit.sentenceIds,
      );
      const listQuestions: any[] = [];

      for (const questionId of listAskingQuestionIds) {
        const inspectedQuestion = questions.find(
          (question) => question._id == questionId,
        );
        if (inspectedQuestion) {
          const {
            code: questionCode,
            choices,
            focus: baseQuestionId,
          } = inspectedQuestion;
          const activeDistracted = choices.filter(
            (choice) => choice.active === true,
          );

          if (ListWorQuestionCodes.includes(questionCode)) {
            baseQuestionId ? setWordIds.add(baseQuestionId) : null;
            for (const choice of activeDistracted) {
              setWordIds.add(choice._id);
            }
          } else if (ListSentenceQuestionCodes.includes(questionCode)) {
            baseQuestionId ? setSentenceIds.add(baseQuestionId) : null;
            for (const choice of activeDistracted) {
              setSentenceIds.add(choice._id);
            }
          }
          const questionOutput = this.questionsHelper.getQuestionOutPut(
            inspectedQuestion,
            activeDistracted,
          );
          listQuestions.push(questionOutput);
        }
      }

      const wordsInLessonPromise = this.wordsService.findByIds([...setWordIds]);
      const sentencesInLessonPromise = this.sentencesService.findByIds([
        ...setSentenceIds,
      ]);
      let wordsInLesson: WordInLesson[] = [];
      let sentencesInLesson: SentenceInLesson[] = [];

      await Promise.all([wordsInLessonPromise, sentencesInLessonPromise])
        .then(([wordsResult, sentencesResult]) => {
          wordsInLesson = wordsResult;
          sentencesInLesson = sentencesResult;
        })
        .catch((error) => {
          throw new InternalServerErrorException(error);
        });

      return {
        wordsInLesson: wordsInLesson,
        sentencesInLesson: sentencesInLesson,
        listQuestions: listQuestions,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public questionsLatestLesson(
    incorrectPercent: number,
    incorrectList: string[],
    rootQuestions: QuestionDocument[],
  ): Array<string> {
    if (incorrectPercent < 20) {
      return incorrectList;
    } else if (incorrectPercent < 40) {
      const mediumQuestions = rootQuestions
        .filter((q) => q.rank == 2 || q.rank == 3)
        .sort(() => 0.5 - Math.random())
        .map((q) => String(q._id));
      return [...incorrectList, ...mediumQuestions].slice(0, 10);
    } else {
      const hardQuestions = rootQuestions
        .filter((q) => q.rank == 1 || q.rank == 4)
        .sort(() => 0.5 - Math.random())
        .map((q) => String(q._id));
      return [...incorrectList, ...hardQuestions].slice(0, 10);
    }
  }

  public multipleChoiceQuestions(
    questions: QuestionDocument[],
  ): QuestionDocument[] {
    const multipleChoiceQuestions = questions.filter((question) =>
      MultipleChoiceCode.includes(question.code),
    );
    if (multipleChoiceQuestions.length === 0) {
      throw new BadRequestException(
        'Not multiple choice question in this level',
      );
    }
    return multipleChoiceQuestions;
  }

  public async toggleChoice(input: {
    bookId: string;
    unitId: string;
    levelIndex: number;
    questionId: string;
    choiceId: string;
  }) {
    // console.log(input)
    const questionHolder = await this.questionHolderModel.findOne({
      bookId: input.bookId,
      unitId: input.unitId,
      level: input.levelIndex,
    });
    if (!questionHolder) {
      throw new BadRequestException();
    }
    const questions = questionHolder.questions;
    if (questions.length === 0) {
      throw new BadRequestException();
    }
    const index = questions.findIndex(
      (question) => question._id === input.questionId,
    );
    if (index === -1) {
      throw new BadRequestException();
    }
    const choiceIndex = questions[index].choices.findIndex(
      (item) => item._id === input.choiceId,
    );
    if (choiceIndex !== -1) {
      questions[index].choices[choiceIndex].active =
        questions[index].choices[choiceIndex].active !== true;
    } else {
      throw new BadRequestException();
    }
    const updateResult = await this.questionHolderModel.updateOne(
      {
        bookId: input.bookId,
        unitId: input.unitId,
        level: input.levelIndex,
      },
      {
        $set: {
          questions: questions,
        },
      },
    );
    if (updateResult.nModified === 1) {
      return true;
    }
    throw new InternalServerErrorException();
  }

  public async addChoice(input: {
    bookId: string;
    unitId: string;
    levelIndex: number;
    questionId: string;
    choiceId: string;
    word?: Partial<WordDocument>;
    sentence?: Partial<SentenceDocument>;
  }) {
    const questionHolder = await this.questionHolderModel.findOne({
      bookId: input.bookId,
      unitId: input.unitId,
      level: input.levelIndex,
    });
    if (!questionHolder) {
      throw new BadRequestException();
    }
    const questions = questionHolder.questions;
    if (questions.length === 0) {
      throw new BadRequestException();
    }
    const index = questions.findIndex(
      (question) => question._id === input.questionId,
    );
    if (index === -1) {
      throw new BadRequestException();
    }
    const choiceIds = questions[index].choices.map((item) => item._id);
    if (choiceIds.includes(input.choiceId)) {
      throw new BadRequestException('already exists');
    }
    questions[index].choices.push({
      _id: input.choiceId,
      active: true,
    });
    const updateResult = await this.questionHolderModel.updateOne(
      {
        bookId: input.bookId,
        unitId: input.unitId,
        level: input.levelIndex,
      },
      {
        $set: {
          questions: questions,
        },
      },
    );
    if (updateResult.nModified === 1) {
      return {
        word: input.word,
        sentence: input.sentence,
      };
    }
    throw new InternalServerErrorException();
  }
}
