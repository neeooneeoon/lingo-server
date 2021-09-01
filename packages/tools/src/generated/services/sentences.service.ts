import { Collection } from 'mongodb';
import { Sentence } from '@lingo/core/src/entities/sentence.entity';
import {
  GenParamsInput,
  SentenceQuestionParam,
} from '@lingo/tools/src/generated/types';
import { getQuestionTypeCode } from '@lingo/tools/src/generated/helper';
import { QUESTION_ENUM } from '@lingo/tools/src/generated/enums';
import { Question } from '@lingo/core/src/entities/question.entity';
import { PunctuationService } from './punctuation.service';

export class SentencesService {
  private readonly sentencesCollection: Collection<Sentence>;

  constructor(_sentencesCollection: Collection<Sentence>) {
    this.sentencesCollection = _sentencesCollection;
  }

  public async sentencesInUnit(bookNId: number, unitNId: number) {
    return this.sentencesCollection
      .find({
        bookNId: bookNId,
        unitNId: unitNId,
      })
      .toArray();
  }

  public async sentencesInBook(bookNId: number) {
    return this.sentencesCollection
      .find({
        bookNId: bookNId,
      })
      .toArray();
  }

  public async findAll() {
    return this.sentencesCollection.find().toArray();
  }

  public static async generateQuestion({
    type,
    focusSentence,
    sentencesInUnit,
    allSentences,
    questionId,
    sentencesCollection,
  }: SentenceQuestionParam & {
    questionId: string;
    sentencesCollection: Collection<Sentence>;
  }): Promise<Question | null> {
    const questionCode = getQuestionTypeCode(QUESTION_ENUM.SENTENCE, type);
    let question: Question | null = null;
    try {
      switch (type) {
        case 1:
        case 2:
        case 12:
        case 17:
          if (type === 1 && !focusSentence.audio) {
            console.log('No audio');
            return null;
          } else if (type === 12 && focusSentence.translateSplit.length <= 10) {
            question = {
              _id: questionId,
              choices: [],
              hiddenIndex: -1,
              code: questionCode,
              focus: focusSentence._id,
              wordId: focusSentence.baseId,
            };
          } else if (type !== 12) {
            question = {
              _id: questionId,
              choices: [],
              hiddenIndex: -1,
              code: questionCode,
              focus: focusSentence._id,
            };
          }
          return question;
        case 7:
          if (focusSentence.wordBaseIndex === -1) return null;
          if (focusSentence.baseId) {
            question = {
              _id: questionId,
              focus: focusSentence._id,
              hiddenIndex: focusSentence.wordBaseIndex,
              choices: [],
              code: questionCode,
              wordId: focusSentence.baseId,
            };
          }
          return question;
        case 10:
          if (sentencesInUnit.length >= 2) {
            const punctuationRegex = /[“”"’'!,?.]/g;
            const punctuations: Array<string> = [];
            const content = focusSentence.content.trim();
            for (const c of content) {
              if (punctuationRegex.test(c)) {
                punctuations.push(c);
              }
            }
            if (punctuations.length > 0) {
              const punctuationService = new PunctuationService(
                punctuations,
                focusSentence,
                sentencesCollection,
              );
              const distractedSentences =
                punctuationService.similaritySentences(allSentences);
              const distractedStories =
                await punctuationService.similarityStories();
              distractedSentences.push(...distractedStories);
              const activeChoices = distractedSentences.map((element) => ({
                _id: element,
                active: true,
              }));
              if (activeChoices.length > 0) {
                question = {
                  _id: questionId,
                  choices: activeChoices,
                  focus: focusSentence._id,
                  hiddenIndex: -1,
                  code: questionCode,
                };
              } else {
                const activeChoices = sentencesInUnit
                  .filter((element) => element._id !== focusSentence._id)
                  .map((element) => ({
                    _id: element._id,
                    active: true,
                  }));
                question = {
                  _id: questionId,
                  code: questionCode,
                  choices: activeChoices,
                  focus: focusSentence._id,
                  hiddenIndex: -1,
                };
              }
            } else {
              console.log(`${focusSentence._id} - ${focusSentence.content}`);
            }
          }
          return question;
        case 14:
        case 15:
        case 16:
          if (type === 14 && focusSentence.audio) {
            question = {
              _id: questionId,
              focus: focusSentence._id,
              hiddenIndex: focusSentence.wordBaseIndex,
              choices: [],
              code: questionCode,
            };
          } else if (type === 15) {
            if (focusSentence.wordBaseIndex !== -1) {
              question = {
                _id: questionId,
                focus: focusSentence._id,
                hiddenIndex: focusSentence.wordBaseIndex,
                choices: [],
                code: questionCode,
              };
            }
          } else if (type === 16) {
            question = {
              _id: questionId,
              focus: focusSentence._id,
              hiddenIndex: -1,
              choices: [],
              code: questionCode,
            };
          }
          return question;
        case 18:
          question = {
            _id: questionId,
            focus: focusSentence._id,
            hiddenIndex: focusSentence.wordBaseIndex,
            choices: [],
            code: questionCode,
          };
          return question;
        case 4:
          question = {
            _id: questionId,
            focus: focusSentence._id,
            hiddenIndex: -1,
            choices: [],
            code: questionCode,
          };
          return question;
        default:
          return question;
      }
    } catch (error) {
      throw error;
    }
  }
  public static getParamsFromPattern(input: GenParamsInput) {
    const indexes = (function () {
      const result: Array<number> = [];
      input.labels.forEach((element, index) => {
        if (element === input.pattern.wordLabel) result.push(index);
      });
      return result;
    })();
    return indexes.map((el) => {
      return {
        type: input.pattern.type,
        wordId: input.wordsIUnit[el]?._id,
        sentenceId:
          input.pattern.sentenceLabel[1] === '0'
            ? input.wordsIUnit[el]?._id.concat('S0')
            : input.wordsIUnit[el]?._id.concat('S') +
              (parseInt(input.pattern.sentenceLabel[1]) - 1),
      };
    });
  }
}
