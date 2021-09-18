import { Collection } from 'mongodb';
import { SentenceInSheet, WordInSheet } from '../types';
import { getID } from '@lingo/tools/src/helpers';
export class UnitService {
  private readonly booksCollection: Collection<any>;
  private readonly wordsCollection: Collection<any>;
  private readonly sentencesCollection: Collection<any>;

  constructor(
    _booksCollection: Collection<any>,
    _wordsCollection: Collection<any>,
    _sentencesCollection: Collection<any>,
  ) {
    this.booksCollection = _booksCollection;
    this.wordsCollection = _wordsCollection;
    this.sentencesCollection = _sentencesCollection;
  }

  private divideRange(rootSize: number, minSize: number) {
    const totalUnits = Math.floor(rootSize / minSize);
    let remainder = rootSize % minSize;
    remainder % 2 !== 0 ? remainder++ : null;
    const ranges = new Array(totalUnits).fill(0);
    let i = 0,
      j = 0;
    while (true) {
      if (totalUnits <= remainder) {
        if (i < totalUnits) {
          if (ranges[i] == 0) {
            ranges[i] = minSize + 1;
          } else {
            ranges[i] = ranges[i] + 1;
          }
          i++;
          j++;
        }
        if (i >= totalUnits) {
          i = 0;
        }
        if (j >= remainder) {
          break;
        }
      } else {
        if (i < totalUnits) {
          if (i < remainder) {
            ranges[i] = minSize + 1;
          } else {
            ranges[i] = minSize;
          }
          i++;
          j++;
        }
        if (i >= totalUnits) {
          break;
        }
      }
    }
    return ranges;
  }

  public async importDemoUnitToCurrentBooks(
    bookName: string,
    unitName: string,
    words: Array<WordInSheet>,
    sentences: Array<SentenceInSheet>,
    minimumNId: number,
    minimumUnitIndex: number,
    position: number,
  ) {
    const wordsSize = words.length;
    if (wordsSize == 0) return;
    const _id = getID(unitName);
    const bookId = getID(bookName);
    if (wordsSize < 12) {
      const unit = {
        _id: _id,
        nId: minimumNId,
        unitIndex: minimumUnitIndex,
        key: _id,
        name: `U${position}. ${unitName}`,
        description: '',
        grammar: '',
        tips: '',
        wordIds: words.map((w) => w._id),
        sentenceIds: sentences.map((s) => s._id),
        normalImage: '',
        blueImage: '',
        stories: [],
        levels: [],
        totalLevels: 0,
        totalLessons: 0,
        totalQuestions: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await this.booksCollection.updateOne(
        { _id: bookId },
        {
          $inc: { totalUnits: 1 },
          $push: { units: unit },
        },
      );
    } else if (wordsSize >= 12 && wordsSize < 16) {
      const ranges = this.divideRange(wordsSize, 6);
      const units = await this.mapRangeToWords(
        words,
        sentences,
        ranges,
        6,
        minimumNId,
        minimumUnitIndex,
        position,
        unitName,
        _id,
      );
      await this.booksCollection.updateOne(
        { _id: bookId },
        {
          $inc: { totalUnits: units.length },
          $push: { units: { $each: units } },
        },
      );
    } else {
      const ranges = this.divideRange(wordsSize, 8);
      console.log(ranges);
      const units = await this.mapRangeToWords(
        words,
        sentences,
        ranges,
        8,
        minimumNId,
        minimumUnitIndex,
        position,
        unitName,
        _id,
      );
      console.log(units);
      await this.booksCollection.updateOne(
        { _id: bookId },
        {
          $inc: { totalUnits: units.length },
          $push: { units: { $each: units } },
        },
      );
    }
  }

  public async mapRangeToWords(
    words: WordInSheet[],
    sentences: SentenceInSheet[],
    ranges: Array<number>,
    minSize: number,
    minimumNId: number,
    minimumUnitIndex: number,
    prefix: number,
    unitName: string,
    _id: string,
  ) {
    const remainder = words.length % minSize;
    const unitNId = minimumNId;
    const totalUnits = Math.floor(words.length / minSize);
    const listUnits: any[] = [];

    for (let index = 0; index < ranges.length; index++) {
      const range = ranges[index];
      let start: number;
      let end: number;

      if (range !== minSize) {
        start = index * range;
        end = (index + 1) * range;
      } else {
        start = index * range + remainder;
        end = (index + 1) * range + remainder;
      }
      const wordIds = words.slice(start, end).map((w) => w._id);
      const sentenceIds = sentences
        .filter((s) => wordIds.includes(s.baseId))
        .map((s) => s._id);

      const unit = {
        _id: `${_id}${index + 1}`,
        nId: unitNId + index,
        unitIndex: minimumUnitIndex + index,
        key: `${_id}${index + 1}`,
        name: `U${prefix}. ${unitName} (${index + 1}/${totalUnits})`,
        description: '',
        grammar: '',
        tips: '',
        wordIds: wordIds,
        sentenceIds: sentenceIds,
        normalImage: '',
        blueImage: '',
        stories: [],
        levels: [],
        totalLevels: 0,
        totalLessons: 0,
        totalQuestions: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      listUnits.push(unit);
      await this.wordsCollection.updateMany(
        { _id: { $in: wordIds } },
        {
          $set: {
            unitNId: unit.nId,
          },
        },
      );
      await this.sentencesCollection.updateMany(
        { _id: { $in: sentenceIds } },
        {
          $set: {
            unitNId: unit.nId,
          },
        },
      );
    }
    return listUnits;
  }
}
