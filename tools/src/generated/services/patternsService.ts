import { QuestionInfo } from 'tools/src/generated/types';
import { GenerationConstants as GC } from 'tools/src/generated/constants';
import { PATTERN_KEYS_ENUM, QUESTION_ENUM } from 'tools/src/generated/enums';

export class PatternsService {
  private readonly grade: number;
  private readonly unitPattern: string;
  private readonly originalPattern: Array<string>;

  constructor(_grade: number) {
    if (Number.isInteger(_grade) && _grade >= 1 && _grade <= 12) {
      this.grade = _grade;
      switch (true) {
        //grade in range [1, 2]
        case this.grade <= 2:
          this.unitPattern = GC.GRADE_PATTERNS[PATTERN_KEYS_ENUM.SEGMENT_1_2]
            .join('')
            .trim();
          this.originalPattern =
            GC.GRADE_PATTERNS[PATTERN_KEYS_ENUM.SEGMENT_1_2];
          break;
        //grade in range [3, 5]
        case this.grade <= 5:
          this.unitPattern = GC.GRADE_PATTERNS[PATTERN_KEYS_ENUM.SEGMENT_3_5]
            .join('')
            .trim();
          this.originalPattern =
            GC.GRADE_PATTERNS[PATTERN_KEYS_ENUM.SEGMENT_3_5];
          break;
        //grade in range [6, 12]
        case this.grade <= 12:
          this.unitPattern = GC.GRADE_PATTERNS[PATTERN_KEYS_ENUM.SEGMENT_6_12]
            .join('')
            .trim();
          this.originalPattern =
            GC.GRADE_PATTERNS[PATTERN_KEYS_ENUM.SEGMENT_6_12];
          break;
        default:
          break;
      }
    } else {
      throw new Error('Grade is invalid.');
    }
  }

  //Get labels in unit labels
  public getLabels(totalWords: number): Array<string> {
    if (this.unitPattern && totalWords > 0 && Number.isInteger(totalWords)) {
      const labelString = this.unitPattern
        .replace(GC.DIGIT_REGEX, '')
        .replace(/[-sw, \n]/g, '');
      const labelSet = [...new Set<string>(labelString.split(''))];
      let cursor = 0;
      const labelResult: Array<string> = [];
      for (let i = 0; i < totalWords; i++) {
        if (cursor >= labelSet.length) cursor = 0;
        labelResult.push(labelSet[cursor]);
        cursor++;
      }
      return labelResult;
    } else {
      throw new Error('Unit pattern is null or no have words in unit.');
    }
  }

  //Get matrix of list level-patterns
  public getLevelsLabels(): Array<Array<string>> {
    if (this.originalPattern) {
      return this.originalPattern.map((element) => {
        return element
          .split(',')
          .map((pattern) => {
            return pattern.trim().replace(/\n/g, '');
          })
          .filter((pattern) => pattern);
      });
    } else {
      throw new Error('originalPattern property is used before assigned.');
    }
  }

  public isInLabels(
    questionInfo: QuestionInfo,
    listLabels: Array<string>,
  ): boolean {
    if (questionInfo.group === QUESTION_ENUM.WORD) {
      if (questionInfo.type === 9) {
        return (
          questionInfo.matchingLabels.filter((element) =>
            listLabels.includes(element),
          ).length >= 2
        );
      } else {
        return (
          questionInfo.wordLabel && listLabels.includes(questionInfo.wordLabel)
        );
      }
    } else {
      return listLabels.includes(questionInfo.wordLabel);
    }
  }
}
