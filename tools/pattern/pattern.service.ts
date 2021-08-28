import { gradeCodePattern, PATTERN_KEYS } from './gradePatterns';
import { digitalRegex } from 'tools/command';

export class PatternService {
  private readonly grade: number;
  private readonly unitPattern: string;
  private readonly originalPattern: Array<string>;

  /**
   *
   * @param _grade must be integer and in range [1, 12]
   */

  constructor(_grade: number) {
    if (Number.isInteger(_grade) && _grade >= 1 && _grade <= 12) {
      this.grade = _grade;
      switch (true) {
        case this.grade <= 2:
          this.unitPattern = gradeCodePattern[PATTERN_KEYS.SEGMENT_1_2]
            .join('')
            .trim();
          this.originalPattern = gradeCodePattern[PATTERN_KEYS.SEGMENT_1_2];
          break;
        case this.grade <= 5:
          this.unitPattern = gradeCodePattern[PATTERN_KEYS.SEGMENT_3_5]
            .join('')
            .trim();
          this.originalPattern = gradeCodePattern[PATTERN_KEYS.SEGMENT_3_5];
          break;
        case this.grade <= 12:
          this.unitPattern = gradeCodePattern[PATTERN_KEYS.SEGMENT_6_12]
            .join('')
            .trim();
          this.originalPattern = gradeCodePattern[PATTERN_KEYS.SEGMENT_6_12];
          break;
        default:
          break;
      }
    } else {
      throw new Error('Grade is invalid.');
    }
  }

  /**
   *
   * @param wordsSetSize must be integer and greater 0
   * @returns list labels; ex: ['a', 'b', 'c', 'd',...]
   */
  public getLabels(wordsSetSize: number): Array<string> {
    if (
      this.unitPattern &&
      wordsSetSize > 0 &&
      Number.isInteger(wordsSetSize)
    ) {
      const labelString = this.unitPattern
        .replace(digitalRegex, '')
        .replace(/[-sw, \n]/g, '');
      const labelSet = [...new Set<string>(labelString.split(''))];
      let cursor = 0;
      const labelResult: Array<string> = [];
      for (let i = 0; i < wordsSetSize; i++) {
        if (cursor >= labelSet.length) cursor = 0;
        labelResult.push(labelSet[cursor]);
        cursor++;
      }
      return labelResult;
    } else {
      throw new Error('Unit pattern is null or no have words in unit.');
    }
  }

  public getLevelsPatterns(): Array<Array<string>> {
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
      throw new Error('[originalPattern] property is used before assigned.');
    }
  }
}
