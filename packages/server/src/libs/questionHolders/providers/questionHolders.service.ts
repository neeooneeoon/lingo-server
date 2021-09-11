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
import { WordInLesson } from '@dto/word';
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
import { QuestionTypeCode } from '@utils/enums';
import { forkJoin, from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BackupQuestionInputDto } from '@dto/backup';

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
      const { questions, listAskingQuestionIds, currentUnit, grade } = input;

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
          } else if (
            questionCode !== QuestionTypeCode.S7 &&
            questionCode !== QuestionTypeCode.S12 &&
            ListSentenceQuestionCodes.includes(questionCode)
          ) {
            for (const choice of choices) {
              setSentenceIds.add(choice._id);
            }
          }
          const questionOutput = this.questionsHelper.getDetailQuestionOutput(
            inspectedQuestion,
            grade,
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

  public async reduceByQuestionIds(
    input: QuestionReducingInput,
  ): Promise<QuestionReducingOutput> {
    try {
      const { questions, listAskingQuestionIds, currentUnit, grade } = input;

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
          } else if (
            questionCode !== QuestionTypeCode.S7 &&
            questionCode !== QuestionTypeCode.S12 &&
            ListSentenceQuestionCodes.includes(questionCode)
          ) {
            for (const choice of choices) {
              setSentenceIds.add(choice._id);
            }
          }
          const questionOutput = this.questionsHelper.getQuestionOutPut(
            inspectedQuestion,
            activeDistracted,
            grade,
          );
          listQuestions.push(questionOutput);
        }
      }
      const [wordsInLesson, sentencesInLesson] = await Promise.all([
        this.wordsService.findByIds([...setWordIds]),
        this.sentencesService.findByIds([...setSentenceIds]),
      ]);
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
    rootQuestions: QuestionDocument[],
    maxSize: number,
  ): Set<string> {
    if (incorrectPercent < 20) {
      return new Set<string>();
    } else if (incorrectPercent < 40) {
      const mediumQuestions = rootQuestions
        .filter((q) => q.rank == 2 || q.rank == 3)
        .sort(() => 0.5 - Math.random())
        .map((q) => String(q._id));
      return new Set<string>(mediumQuestions.slice(0, maxSize));
    } else {
      const hardQuestions = rootQuestions
        .filter((q) => q.rank == 1 || q.rank == 4)
        .sort(() => 0.5 - Math.random())
        .map((q) => String(q._id));
      return new Set<string>(hardQuestions.slice(0, maxSize));
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

  public toggleChoice(input: {
    bookId: string;
    unitId: string;
    levelIndex: number;
    questionId: string;
    choiceId: string;
  }) {
    return from(
      this.questionHolderModel.findOne({
        bookId: input.bookId,
        unitId: input.unitId,
        level: input.levelIndex,
      }),
    ).pipe(
      map((questionHolder) => {
        if (!questionHolder)
          throw new BadRequestException('Not found questionHolder');
        const questions = questionHolder.questions;
        if (questions.length === 0)
          throw new BadRequestException('Set questions is empty.');
        const questionIndex = questions.findIndex(
          (question) => question._id === input.questionId,
        );
        if (questionIndex === -1)
          throw new BadRequestException('Not found question');
        const choiceIndex = questions[questionIndex].choices.findIndex(
          (choice) => choice._id === input.choiceId,
        );
        if (choiceIndex === -1)
          throw new BadRequestException('Not found choice');
        const status = questions[questionIndex].choices[choiceIndex].active;
        questions[questionIndex].choices[choiceIndex].active = status !== true;
        return {
          questions: questions,
          choice: questions[questionIndex].choices[choiceIndex],
          focusQuestion: questions[questionIndex],
        };
      }),
      switchMap(({ questions, choice, focusQuestion }) => {
        return forkJoin([
          from([choice]),
          from([focusQuestion]),
          this.questionHolderModel.updateOne(
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
          ),
        ]);
      }),
      map(([choice, focusQuestion, updateResult]) => {
        if (updateResult.nModified === 1) {
          return {
            choice,
            focusQuestion,
          };
        }
      }),
    );
  }

  public addChoice(input: {
    bookId: string;
    unitId: string;
    levelIndex: number;
    questionId: string;
    choiceId: string;
    word?: Partial<WordDocument>;
    sentence?: Partial<SentenceDocument>;
  }): Observable<{
    word: Partial<WordDocument>;
    sentence: Partial<SentenceDocument>;
  }> {
    return from(
      this.questionHolderModel.findOne({
        bookId: input.bookId,
        unitId: input.unitId,
        level: input.levelIndex,
      }),
    ).pipe(
      map((questionHolder) => {
        if (!questionHolder)
          throw new BadRequestException('Not found questionHolder.');
        const questions = questionHolder.questions;
        if (questions.length === 0)
          throw new BadRequestException('Set questions is empty.');
        const questionIndex = questions.findIndex(
          (question) => question._id === input.questionId,
        );
        if (questionIndex === -1)
          throw new BadRequestException('Not found question.');
        const choiceIds = questions[questionIndex].choices.map(
          (choice) => choice._id,
        );
        if (choiceIds.includes(input.choiceId))
          throw new BadRequestException('Already in choices.');
        questions[questionIndex].choices.push({
          _id: input.choiceId,
          active: true,
        });
        return questions;
      }),
      switchMap((questions) => {
        return this.questionHolderModel.updateOne(
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
      }),
      map((updateResult) => {
        if (updateResult.nModified === 1)
          return { word: input.word, sentence: input.sentence };
        throw new BadRequestException('Update failed.');
      }),
    );
  }

  public changeChoicesInQuestion(backupInput: BackupQuestionInputDto) {
    const keyPaths = Object.keys(backupInput);
    return forkJoin(
      keyPaths.map((path) => {
        const [bookId, unitId] = path.split('/');
        return from(
          this.questionHolderModel
            .find({
              bookId,
              unitId,
            })
            .lean(),
        ).pipe(
          switchMap((questionHolders) => {
            if (questionHolders?.length > 0) {
              return forkJoin(
                questionHolders.map((questionHolder) => {
                  const questions = questionHolder.questions;
                  if (questions?.length > 0) {
                    backupInput[path].forEach((backupItem) => {
                      const { focusId, choiceId, code, active } = backupItem;
                      const questionIndex = questions.findIndex(
                        (question) =>
                          question.code == code && question.focus === focusId,
                      );
                      if (questionIndex !== -1) {
                        const setChoiceIds = new Set<string>(
                          questions[questionIndex].choices.map(
                            (choice) => choice._id,
                          ),
                        );
                        if (!setChoiceIds.has(choiceId)) {
                          setChoiceIds.add(choiceId);
                          questions[questionIndex].choices.push({
                            _id: choiceId,
                            active,
                          });
                        } else {
                          const choiceIndex = questions[
                            questionIndex
                          ].choices.findIndex(
                            (choice) => choice._id === choiceId,
                          );
                          if (choiceIndex !== -1) {
                            questions[questionIndex].choices[
                              choiceIndex
                            ].active = active;
                          }
                        }
                      }
                    });
                    return from(
                      this.questionHolderModel.updateOne(
                        {
                          bookId: questionHolder.bookId,
                          unitId: questionHolder.unitId,
                          level: questionHolder.level,
                        },
                        {
                          $set: {
                            questions: questions,
                          },
                        },
                      ),
                    );
                  }
                }),
              );
            }
          }),
        );
      }),
    );
  }

  public async removeDuplicateChoices() {
    const questionHolders = await this.questionHolderModel.find();
    const codes = [
      QuestionTypeCode.W3,
      QuestionTypeCode.W6,
      QuestionTypeCode.W2,
      QuestionTypeCode.W4,
      QuestionTypeCode.W13,
      QuestionTypeCode.W9,
      QuestionTypeCode.S10,
      QuestionTypeCode.S7,
    ];
    for (const questionHolder of questionHolders) {
      const questions = questionHolder.questions;
      for (let i = 0; i < questions.length; i++) {
        if (
          questions[i].choices.length > 0 &&
          codes.includes(questions[i].code)
        ) {
          const choices = questions[i].choices;
          const realAnswers: { _id: string; active: boolean }[] = [];
          const group = [
            QuestionTypeCode.W3,
            QuestionTypeCode.W6,
            QuestionTypeCode.W2,
            QuestionTypeCode.W4,
            QuestionTypeCode.W13,
            QuestionTypeCode.W9,
          ].includes(questions[i].code)
            ? 'WORD'
            : 'SENTENCE';
          for (const choice of choices) {
            const index = realAnswers.findIndex((el) => el._id === choice._id);
            if (index === -1) {
              if (group === 'WORD') {
                const realWord = await this.wordsService.findById(choice._id);
                if (realWord) {
                  realAnswers.push(choice);
                }
              } else {
                if (questions[i].code !== QuestionTypeCode.S7) {
                  const realSentence = await this.sentencesService.findById(
                    choice._id,
                  );
                  if (realSentence) {
                    realAnswers.push(choice);
                  }
                } else {
                  if (choice._id.trim()) {
                    realAnswers.push(choice);
                  }
                }
              }
            }
          }
          questions[i].choices = realAnswers;
        }
      }
      await this.questionHolderModel.updateOne(
        {
          _id: questionHolder._id,
        },
        {
          $set: {
            questions: questions,
          },
        },
      );
    }
  }
}
