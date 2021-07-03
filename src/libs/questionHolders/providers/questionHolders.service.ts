import { QuestionHolder, QuestionHolderDocument } from "@entities/questionHolder.entity";
import { QuestionDocument } from "@entities/question.entity";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GetQuestionHolderInput, QuestionReducingInput, QuestionReducingOutput } from "@dto/questionHolder";
import { WordsService } from "@libs/words/words.service";
import { SentencesService } from "@libs/sentences/sentences.service";
import { WordInLesson } from "@dto/word/wordInLesson.dto";
import { SentenceInLesson } from "@dto/sentence";
import { ListWorQuestionCodes, ListSentenceQuestionCodes } from "@utils/constants";
import { QuestionsHelper } from "@helpers/questionsHelper";
import { Unit, UnitDocument } from "@entities/unit.entity";

@Injectable()
export class QuestionHoldersService {

    constructor(
        @InjectModel(QuestionHolder.name) private questionHolderModel: Model<QuestionHolderDocument>,
        @InjectModel(Unit.name) private unitModel: Model<UnitDocument>,
        private wordsService: WordsService,
        private sentencesService: SentencesService,
        private questionsHelper: QuestionsHelper,
    ) { }

    public async getQuestionHolder(input: GetQuestionHolderInput): Promise<QuestionHolderDocument> {
        try {
            const {
                bookId,
                unitId,
                level
            } = input;
            const questionHolder = await this.questionHolderModel.findOne({
                bookId: bookId,
                unitId: unitId,
                level: level
            });
            if (!questionHolder) {
                throw new BadRequestException(`Can't not find question holder with ${input}`)
            }
            return questionHolder;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async reduceByQuestionIds(input: QuestionReducingInput): Promise<QuestionReducingOutput> {
        try {
            const {
                questions,
                listAskingQuestionIds,
                currentUnit
            } = input;

            const setWordIds: Set<string> = new Set<string>(currentUnit.wordIds);
            const setSentenceIds: Set<string> = new Set<string>(currentUnit.sentenceIds);
            const listQuestions: any[] = []

            for (const questionId of listAskingQuestionIds) {
                const inspectedQuestion = questions.find(question => question._id == questionId);
                if (inspectedQuestion) {
                    const {
                        code: questionCode,
                        choices,
                        focus: baseQuestionId
                    } = inspectedQuestion;

                    if (ListWorQuestionCodes.includes(questionCode)) {
                        baseQuestionId ? setWordIds.add(baseQuestionId) : null;
                        for (const choice of choices) {
                            setWordIds.add(choice);
                        }
                    }
                    else if (ListSentenceQuestionCodes.includes(questionCode)) {
                        baseQuestionId ? setSentenceIds.add(baseQuestionId) : null;
                        for (const choice of choices) {
                            setSentenceIds.add(choice);
                        }
                    }
                    const questionOutput = this.questionsHelper.getQuestionOutPut(inspectedQuestion);
                    listQuestions.push(questionOutput);
                }
            }

            const wordsInLessonPromise = this.wordsService.findByIds([...setWordIds]);
            const sentencesInLessonPromise = this.sentencesService.findByIds([...setSentenceIds]);
            let wordsInLesson: WordInLesson[] = [];
            let sentencesInLesson: SentenceInLesson[] = [];

            await Promise.all([wordsInLessonPromise, sentencesInLessonPromise])
                .then(([wordsResult, sentencesResult]) => {
                    wordsInLesson = wordsResult;
                    sentencesInLesson = sentencesResult;
                })
                .catch(error => {
                    throw new InternalServerErrorException(error);
                })

            return {
                wordsInLesson: wordsInLesson,
                sentencesInLesson: sentencesInLesson,
                listQuestions: listQuestions
            }

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

    public async getQuestionsInLevel(bookId: string, unitId: string, levelIndex: number) {
        try {
            const findQuestionHolderPromise = this.questionHolderModel.findOne({
                bookId: bookId,
                unitId: unitId,
                level: levelIndex
            });
            const findUnitPromise = this.unitModel.findById(unitId);
            let questionHolder: QuestionHolderDocument;
            let unit: UnitDocument;

            await Promise.all([findQuestionHolderPromise, findUnitPromise])
                .then(([questionHolderResult, unitResult]) => {
                    questionHolder = questionHolderResult;
                    unit = unitResult;
                })
                .catch(error => {
                    throw new BadRequestException(error);
                })
            if (!questionHolder || questionHolder.questions.length === 0) {
                throw new BadRequestException(`Can't find questions in path /${bookId}/${unitId}/${levelIndex}`);
            }
            if (!unit) {
                throw new BadRequestException(`Can't fine unit ${unitId}`);
            }
            const multipleChoiceQuestions = this.multipleChoiceQuestions(questionHolder.questions);
            const questionIds = multipleChoiceQuestions.map(question => question._id);
            const questionsInLevel = await this.reduceByQuestionIds({
                currentUnit: unit,
                questions: multipleChoiceQuestions,
                listAskingQuestionIds: questionIds
            });
            return questionsInLevel;
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    public multipleChoiceQuestions(questions: QuestionDocument[]): QuestionDocument[] {
        const multipleChoiceQuestions = questions.filter(question => question.choices && question.choices.length > 0);
        if (multipleChoiceQuestions.length === 0) {
            throw new BadRequestException('Not multiple choice question in this level');
        }
        return multipleChoiceQuestions
    }

}