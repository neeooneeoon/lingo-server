import { AnswerResult } from '@dto/lesson';
import { QuestionDocument } from '@entities/question.entity';
import { SentencesService } from '@libs/sentences/sentences.service';
import { WordsService } from '@libs/words/words.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ListWorQuestionCodes } from '@utils/constants';
import { QuestionTypeCode } from '@utils/enums';

@Injectable()
export class AnswerService {
  constructor(
    private readonly wordsService: WordsService,
    private readonly sentencesService: SentencesService,
  ) {}

  public checkMatchSplitSemantic(
    userAnswer: string[],
    correctAnswer: string[],
  ): boolean {
    const deepRegex = new RegExp(/[\!\.\:\;\~\`\_\?\,\”\’\‘\“\"\’\'\ \-]/g);
    const formattedUserAnswer = userAnswer
      .join('')
      .toLowerCase()
      .replace(deepRegex, '');
    const formattedCorrectAnswer = correctAnswer
      .join('')
      .toLowerCase()
      .replace(deepRegex, '');

    return formattedUserAnswer === formattedCorrectAnswer;
  }

  public async checkAnswerWordQuestion(
    result: AnswerResult,
    question: QuestionDocument,
  ): Promise<boolean> {
    try {
      let isCorrect = false;
      const { code, focus: wordId } = question;
      const { answer } = result;
      switch (code) {
        case QuestionTypeCode.W9:
          isCorrect = true;
          break;
        case QuestionTypeCode.W2:
        case QuestionTypeCode.W3:
        case QuestionTypeCode.W4:
        case QuestionTypeCode.W6:
        case QuestionTypeCode.W13:
          isCorrect = typeof answer === 'string' && answer === wordId;
          break;
        case QuestionTypeCode.W7:
        case QuestionTypeCode.W11:
        case QuestionTypeCode.W14:
          if (typeof answer === 'string') {
            const word = await this.wordsService.getWord(wordId);
            const formattedContent = word.content.trim().toLowerCase();
            const formattedAnswer = answer.trim().toLowerCase();
            isCorrect = formattedAnswer === formattedContent;
          }
          break;
        case QuestionTypeCode.W8:
          if (typeof answer === 'string') {
            const word = await this.wordsService.getWord(wordId);
            const formattedMeaning = word.meaning.trim().toLowerCase();
            const formattedAnswer = answer.trim().toLowerCase();
            isCorrect = formattedAnswer === formattedMeaning;
          }
          break;
        case QuestionTypeCode.W12:
          isCorrect = typeof answer === 'boolean' && answer === true;
          break;
        default:
          break;
      }
      return isCorrect;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async checkAnswerSentenceQuestion(
    result: AnswerResult,
    question: QuestionDocument,
  ): Promise<boolean> {
    try {
      let isCorrect = false;
      const { code, focus: sentenceId, hiddenIndex } = question;
      const { answer } = result;
      const deepRegex = new RegExp(/[\!\.\:\;\~\`\_\?\,\”\’\‘\“\"\’\'\ \-]/g);
      switch (code) {
        case QuestionTypeCode.S10:
          isCorrect = typeof answer === 'string' && answer === sentenceId;
          break;
        case QuestionTypeCode.S12:
          if (Array.isArray(answer)) {
            const sentence = await this.sentencesService.getSentence(
              sentenceId,
            );
            const translateSplit = sentence.translateSplit.map(
              (item) => item.text,
            );
            isCorrect = this.checkMatchSplitSemantic(
              answer as string[],
              translateSplit,
            );
          }
          break;
        case QuestionTypeCode.S1:
        case QuestionTypeCode.S2:
        case QuestionTypeCode.S17:
          if (Array.isArray(answer)) {
            const sentence = await this.sentencesService.getSentence(
              sentenceId,
            );
            const contentSplit = sentence.contentSplit.map((item) => item.text);
            isCorrect = this.checkMatchSplitSemantic(
              answer as string[],
              contentSplit,
            );
          }
        case QuestionTypeCode.S4:
          isCorrect = typeof answer === 'boolean' && answer === true;
          break;
        case QuestionTypeCode.S7:
        case QuestionTypeCode.S15:
          if (typeof answer === 'string') {
            const sentence = await this.sentencesService.getSentence(
              sentenceId,
            );
            const hiddenText = sentence.contentSplit[hiddenIndex].text
              .toLowerCase()
              .replace(deepRegex, '');
            const formattedAnswer = answer.toLowerCase().replace(deepRegex, '');
            isCorrect = formattedAnswer === hiddenText;
          }
          break;
        case QuestionTypeCode.S14:
        case QuestionTypeCode.S18:
          if (typeof answer === 'string') {
            const sentence = await this.sentencesService.getSentence(
              sentenceId,
            );
            const formattedContent = sentence.content
              .replace(deepRegex, '')
              .toLowerCase();
            const formattedAnswer = answer.toLowerCase().replace(deepRegex, '');
            isCorrect = formattedAnswer === formattedContent;
          }
          break;
        case QuestionTypeCode.S16:
          if (typeof answer === 'string') {
            const sentence = await this.sentencesService.getSentence(
              sentenceId,
            );
            const formattedContent = sentence.translate
              .replace(deepRegex, '')
              .toLowerCase();
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

  public async checkAnswer(
    result: AnswerResult,
    question: QuestionDocument,
  ): Promise<boolean> {
    try {
      let isCorrect: boolean;
      if (ListWorQuestionCodes.includes(question.code)) {
        isCorrect = await this.checkAnswerWordQuestion(result, question);
      } else {
        isCorrect = await this.checkAnswerSentenceQuestion(result, question);
      }
      return isCorrect;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
