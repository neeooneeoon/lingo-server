import { QuestionHolder, QuestionHolderDocument } from "@entities/questionHolder.entity";
import { Question, QuestionDocument } from "@entities/question.entity";
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

@Injectable()
export class QuestionHoldersService {

    constructor(
        @InjectModel(QuestionHolder.name) private questionHolderModel: Model<QuestionHolderDocument>,
        private wordsService: WordsService,
        private sentencesService: SentencesService,
        private questionsHelper: QuestionsHelper,
    ) { }

    private checkMatchSplitSemantic(userAnswer: string[], correctAnswer: string[]): boolean {

        const deepRegex = new RegExp(/[\!\.\:\;\~\`\_\?\,\”\’\‘\“\"\’\'\ \-]/g);
        const formattedUserAnswer = userAnswer.join('').toLowerCase().replace(deepRegex, '');
        const formattedCorrectAnswer = correctAnswer.join('').toLowerCase().replace(deepRegex, '');

        return formattedUserAnswer === formattedCorrectAnswer;

    }

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


}