import { Collection } from 'mongodb';
import { Word } from '@lingo/core/src/entities/word.entity';
import { Question } from '@lingo/core/src/entities/question.entity';
import { QUESTION_ENUM } from '@lingo/tools/src/generated/enums';
import { getQuestionTypeCode } from '@lingo/tools/src/generated/helper';
import {
  WordQuestionParam,
  GenParamsInput,
} from '@lingo/tools/src/generated/types';
import { QuestionTypeCode } from '@lingo/core/src/utils/enums';

export class WordsService {
  private readonly wordsCollection: Collection<Word>;

  constructor(_wordsCollection: Collection<Word>) {
    this.wordsCollection = _wordsCollection;
  }

  public async wordsInUnit(bookNId: number, unitNId: number) {
    return this.wordsCollection
      .find({
        bookNId: bookNId,
        unitNId: unitNId,
      })
      .toArray();
  }

  public static getParamsFromPattern(
    input: GenParamsInput,
  ): Array<WordQuestionParam> {
    if (input.pattern.type !== 9) {
      const result: Array<WordQuestionParam> = [];
      input.labels.forEach((label, index) => {
        if (label === input.pattern.wordLabel) {
          result.push({
            type: input.pattern.type,
            wordsIUnit: input.wordsIUnit,
            focusId: input.wordsIUnit[index]._id,
            matchingLabels: [],
          });
        }
      });
      return result;
    } else {
      const labelsCloned = Array.from(input.labels);
      const matchingLabelMatrix: Array<Array<number>> = [];
      const paramResults: Array<WordQuestionParam> = [];
      while (true) {
        const matchingLabels: Array<number> = [];
        for (const label of input.pattern.matchingLabels) {
          const labelIndex = labelsCloned.indexOf(label);
          if (labelIndex !== -1) {
            matchingLabels.push(labelIndex);
            labelsCloned[labelIndex] = '';
          }
        }
        if (matchingLabels.length > 0) {
          matchingLabelMatrix.push(matchingLabels);
        } else {
          break;
        }
      }
      if (matchingLabelMatrix.length > 0) {
        for (const row of matchingLabelMatrix) {
          if (row.length > 0) {
            const contentSet = new Set<string>();
            const meaningSet = new Set<string>();
            const wordIdSet = new Set<string>();
            for (const value of row) {
              const matchingWord = input.wordsIUnit[value];
              if (matchingWord) {
                const matchingContent = matchingWord.content
                  .trim()
                  .toLowerCase()
                  .normalize('NFKD');
                const matchingMeaning = matchingWord.meaning
                  .trim()
                  .toLowerCase()
                  .normalize('NFKD');
                if (
                  !contentSet.has(matchingContent) &&
                  !meaningSet.has(matchingMeaning) &&
                  !wordIdSet.has(matchingWord._id)
                ) {
                }
                {
                  contentSet.add(matchingContent);
                  meaningSet.add(matchingMeaning);
                  wordIdSet.add(matchingWord._id);
                }
              }
            }
            if (wordIdSet.size > 0) {
              paramResults.push({
                type: input.pattern.type,
                focusId: `level${input.level}-matching${input.matchingCounter.n}`,
                matchingLabels: [...wordIdSet],
                wordsIUnit: input.wordsIUnit,
              });
              input.matchingCounter.n++;
            }
          }
        }
      }
      return paramResults;
    }
  }

  public static generateQuestion(
    param: WordQuestionParam & { questionId: string },
  ): Question | undefined {
    function getChoices(hasImageWords: Array<Word>, focusId: string) {
      return hasImageWords
        .filter((element) => {
          return element._id !== focusId;
        })
        .slice(0, 3)
        .map((element) => ({
          _id: element._id,
          active: true,
        }));
    }
    const hasImageWords = param.wordsIUnit.filter(
      (element) => element.imageRoot,
    );

    const questionCode = getQuestionTypeCode(QUESTION_ENUM.WORD, param.type);
    switch (param.type) {
      case 2:
      case 3:
      case 4:
        if (
          hasImageWords.findIndex(
            (element) => element._id === param.focusId,
          ) !== -1 &&
          hasImageWords.length >= 2
        ) {
          return {
            _id: param.questionId,
            choices: getChoices(hasImageWords, param.focusId),
            focus: param.focusId,
            hiddenIndex: -1,
            code: questionCode,
          };
        } else {
          return {
            _id: param.questionId,
            choices: [],
            focus: param.focusId,
            hiddenIndex: -1,
            code:
              Math.random() < 0.5 ? QuestionTypeCode.W6 : QuestionTypeCode.W13,
          };
        }
      case 6:
      case 13:
        if (param.wordsIUnit.length >= 2) {
          return {
            _id: param.questionId,
            choices: [],
            focus: param.focusId,
            hiddenIndex: -1,
            code: questionCode,
          };
        } else return undefined;
      case 8:
      case 11:
      case 12:
      case 14:
        return {
          _id: param.questionId,
          choices: [],
          focus: param.focusId,
          hiddenIndex: -1,
          code: questionCode,
        };
      case 9:
        return {
          _id: param.questionId,
          choices: param.matchingLabels.map((element) => ({
            _id: element,
            active: true,
          })),
          focus: param.focusId,
          hiddenIndex: -1,
          code: questionCode,
        };
      case 7:
        const focusWord = param.wordsIUnit.find(
          (element) => element._id === param.focusId,
        );
        if (focusWord) {
          if (focusWord?.imageRoot) {
            return {
              _id: param.questionId,
              choices: [],
              hiddenIndex: -1,
              focus: param.focusId,
              code: questionCode,
            };
          } else {
            return {
              _id: param.questionId,
              choices: [],
              hiddenIndex: -1,
              focus: param.focusId,
              code: QuestionTypeCode.W11,
            };
          }
        } else {
          return undefined;
        }
    }
    return undefined;
  }
}
