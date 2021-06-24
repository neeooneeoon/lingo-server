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
import { AnswerResult } from "@dto/lesson";
import { QuestionTypeCode } from "@utils/enums";

@Injectable()
export class QuestionHoldersService {

    constructor(
        @InjectModel(QuestionHolder.name) private questionHolderModel: Model<QuestionHolderDocument>,
        @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
        private wordsService: WordsService,
        private sentencesService: SentencesService,
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
                sentencesInLesson: sentencesInLesson
            }

        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    private async checkAnswerWordQuestion(result: AnswerResult, question: QuestionDocument): Promise<boolean> {
        try {
            let isCorrect: boolean = false;
            const {
                code,
                focus: wordId,
            } = question;
            const {
                answer
            } = result;
            switch (code) {
                case QuestionTypeCode.W9:
                    isCorrect = true;
                    break;
                case QuestionTypeCode.W2:
                case QuestionTypeCode.W3:
                case QuestionTypeCode.W4:
                case QuestionTypeCode.W6:
                case QuestionTypeCode.W13:
                    isCorrect = typeof answer === "string" && answer === wordId;
                    break;
                case QuestionTypeCode.W7:
                case QuestionTypeCode.W11:
                case QuestionTypeCode.W14:
                    if (typeof answer === "string") {
                        const word = await this.wordsService.getWord(wordId);
                        const formattedContent = word.content.trim().toLowerCase();
                        const formattedAnswer = answer.trim().toLowerCase();
                        isCorrect = formattedAnswer === formattedContent;
                    }
                    break;
                case QuestionTypeCode.W8:
                    if (typeof answer === "string") {
                        const word = await this.wordsService.getWord(wordId);
                        const formattedMeaning = word.meaning.trim().toLowerCase();
                        const formattedAnswer = answer.trim().toLowerCase();
                        isCorrect = formattedAnswer === formattedMeaning;
                    }
                    break;
                case QuestionTypeCode.W12:
                    isCorrect = typeof answer === "boolean" && answer === true;
                    break;
                default:
                    break;
            }
            return isCorrect;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    private async checkAnswerSentenceQuestion(result: AnswerResult, question: QuestionDocument): Promise<boolean> {
        try {
            let isCorrect: boolean = false;
            const {
                code,
                focus: sentenceId,
                hiddenIndex,
            } = question;
            const {
                answer
            } = result;
            const deepRegex = new RegExp(/[\!\.\:\;\~\`\_\?\,\”\’\‘\“\"\’\'\ \-]/g);
            switch (code) {
                case QuestionTypeCode.S10:
                    isCorrect = typeof answer === "string" && answer === sentenceId;
                    break;
                case QuestionTypeCode.S12:
                    if (Array.isArray(answer)) {
                        const sentence = await this.sentencesService.getSentence(sentenceId);
                        const translateSplit = sentence.translateSplit.map(item => item.text);
                        isCorrect = this.checkMatchSplitSemantic(answer as string[], translateSplit);
                    }
                    break;
                case QuestionTypeCode.S1:
                case QuestionTypeCode.S2:
                case QuestionTypeCode.S17:
                    if (Array.isArray(answer)) {
                        const sentence = await this.sentencesService.getSentence(sentenceId);
                        const contentSplit = sentence.contentSplit.map(item => item.text);
                        isCorrect = this.checkMatchSplitSemantic(answer as string[], contentSplit);
                    }
                case QuestionTypeCode.S4:
                    isCorrect = typeof answer === "boolean" && answer === true;
                    break;
                case QuestionTypeCode.S7:
                case QuestionTypeCode.S15:
                    if (typeof answer === "string") {
                        const sentence = await this.sentencesService.getSentence(sentenceId);
                        const hiddenText = sentence.contentSplit[hiddenIndex].text.toLowerCase().replace(deepRegex, '');
                        const formattedAnswer = answer.toLowerCase().replace(deepRegex, '');
                        isCorrect = formattedAnswer === hiddenText;
                    }
                    break;
                case QuestionTypeCode.S14:
                case QuestionTypeCode.S18:
                    if (typeof answer === "string") {
                        const sentence = await this.sentencesService.getSentence(sentenceId);
                        const formattedContent = sentence.content.replace(deepRegex, '').toLowerCase();
                        const formattedAnswer = answer.toLowerCase().replace(deepRegex, '');
                        isCorrect = formattedAnswer === formattedContent;
                    }
                    break;
                case QuestionTypeCode.S16:
                    if (typeof answer === "string") {
                        const sentence = await this.sentencesService.getSentence(sentenceId);
                        const formattedContent = sentence.translate.replace(deepRegex, '').toLowerCase();
                        const formattedAnswer = answer.toLowerCase().replace(deepRegex, '');
                        isCorrect = formattedAnswer === formattedContent;
                    }
                    break;
                default:
                    break;
            }
            return isCorrect;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async checkAnswer(result: AnswerResult, question: QuestionDocument): Promise<boolean> {
        try {
            let isCorrect: boolean = false;
            if (ListWorQuestionCodes.includes(question.code)) {
                isCorrect = await this.checkAnswerWordQuestion(result, question);
            }
            else {
                isCorrect = await this.checkAnswerSentenceQuestion(result, question);
            }
            return isCorrect;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

}