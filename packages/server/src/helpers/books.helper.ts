import { BookGrade } from '@dto/book';
import { BookDocument } from '@entities/book.entity';
import { LeanDocument } from 'mongoose';
import { BookProgressMetaData } from '@utils/types';

export class BooksHelper {
  public mapToBookGrade(
    book: LeanDocument<BookDocument>,
    progressBook?: BookProgressMetaData | undefined,
  ): BookGrade {
    return {
      _id: book._id,
      bookNId: book.nId,
      name: book.name,
      grade: book.grade,
      cover: book.cover,
      totalWords: book.totalWords,
      totalUnits: book.units.length,
      description: book.description,
      totalQuestions: book.totalQuestions,
      totalLessons: book.totalLessons,
      doneLessons: progressBook
        ? progressBook?.doneLessons > book.totalLessons
          ? book.totalLessons
          : progressBook?.doneLessons
        : 0,
      doneQuestions: progressBook
        ? progressBook?.doneQuestions > book.totalQuestions
          ? book.totalQuestions
          : progressBook?.doneQuestions
        : 0,
    };
  }
  public getID(alias: string): string {
    let str = alias;
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(
      /!|@|%|\^|\*|\(|\)|\+|\=|\<| |\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
      '',
    );
    str = str.replace(/ + /g, '');
    str = str.trim();
    return str;
  }
  public divideRange(rootSize: number, minSize: number) {
    const totalUnits = Math.floor(rootSize / minSize);
    // const remainder = rootSize % minSize;
    const ranges = new Array(totalUnits).fill(0);
    // const i = 0,
    //   j = 0;
    // while (true) {
    //   if (totalUnits <= remainder) {
    //     if (i < totalUnits) {
    //       if (ranges[i] == 0) {
    //         ranges[i] = minSize + 1;
    //       } else {
    //         ranges[i] = ranges[i] + 1;
    //       }
    //       i++;
    //       j++;
    //     }
    //     if (i >= totalUnits) {
    //       i = 0;
    //     }
    //     if (j >= remainder) {
    //       break;
    //     }
    //   } else {
    //     if (i < totalUnits) {
    //       if (i < remainder) {
    //         ranges[i] = minSize + 1;
    //       } else {
    //         ranges[i] = minSize;
    //       }
    //       i++;
    //       j++;
    //     }
    //     if (i >= totalUnits) {
    //       break;
    //     }
    //   }
    // }
    return ranges;
  }
}
