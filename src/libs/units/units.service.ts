import { BookDocument, Book } from '@entities/book.entity';
import { BooksHelper } from '@helpers/books.helper';
import { BooksService } from '@libs/books/providers/books.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UnitsService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
    private booksHelper: BooksHelper,
  ) {}

  // public async importUnit(rows: string[][], images: ImageResult): Promise<void> {
  //     let j = 1;
  //     let temp = 0;
  //     for (let i = 1; i < rows.length; i++) {
  //         const bookNId = Number(rows[i][2]);
  //         const bookId = this.booksHelper.getID(rows[i][3]).trim();
  //         const bookName = rows[i][3].trim();
  //         const unitNId = Number(rows[i][1]);
  //         if (bookNId == 1 || bookNId == 3) {
  //             continue;
  //         }
  //         const _id = this.booksHelper.getID(rows[i][4]);

  //         if (bookNId % 2 == 0 && temp !== bookNId) {
  //             j = 1;
  //             temp = bookNId;
  //         }
  //         const wordsInUnit = await Words.find({
  //             bookNId: bookNId,
  //             unitNId: unitNId,
  //         });
  //         const sentencesInUnit = await Sentences.find({
  //             bookNId: bookNId,
  //             unitNId: unitNId,
  //         });
  //         const wordsSize = wordsInUnit.length;
  //         const unitImages = images[bookNId].find(item => item.id == _id);
  //         const prefixNormal = `https://s.saokhuee.com/lingo/anhunit/${bookName}/normal/`;
  //         const prefixBlue = `https://s.saokhuee.com/lingo/anhunit/${bookName}/blue/`;
  //         if (wordsSize < 12) {
  //             const unit = new Unit({
  //                 _id: _id,
  //                 nId: Number(rows[i][1]) * 100,
  //                 unitIndex: Number(rows[i][7]) * 100,
  //                 key: rows[i][0],
  //                 name: `U${j}. ${rows[i][4]}`,
  //                 description: rows[i][3],
  //                 grammar: rows[i][5],
  //                 tips: rows[i][6],
  //                 wordIds: wordsInUnit.map((w) => w._id),
  //                 sentenceIds: sentencesInUnit.map((s) => s._id),
  //                 normalImage: unitImages && unitImages?.normal ? prefixNormal + unitImages.normal : '',
  //                 blueImage: unitImages && unitImages?.blue ? prefixBlue + unitImages.blue : ''
  //             });
  //             await Words.updateMany(
  //                 { bookNId: bookNId, unitNId: unitNId },
  //                 { unitNId: 100 * unitNId }
  //             );
  //             await Sentences.updateMany(
  //                 { bookNId: bookNId, unitNId: unitNId },
  //                 { unitNId: 100 * unitNId }
  //             );
  //             await Books.updateOne(
  //                 { nId: Number(rows[i][2]) },
  //                 {
  //                     $inc: { totalUnits: 1 },
  //                     $push: { units: unit },
  //                 }
  //             );
  //         }
  //         else if (wordsSize >= 12 && wordsSize < 16) {
  //             const ranges = divideRange(wordsSize, 6);
  //             const units = await mapRangeToWords(
  //                 wordsInUnit,
  //                 sentencesInUnit,
  //                 ranges,
  //                 6,
  //                 rows[i],
  //                 j,
  //                 unitImages,
  //                 bookName
  //             );
  //             await Books.updateOne(
  //                 { nId: Number(rows[i][2]) },
  //                 {
  //                     $inc: { totalUnits: units.length },
  //                     $push: { units: { $each: units } },
  //                 }
  //             );
  //         }
  //         else {
  //             const ranges = divideRange(wordsSize, 8);
  //             const units = await mapRangeToWords(
  //                 wordsInUnit,
  //                 sentencesInUnit,
  //                 ranges,
  //                 8,
  //                 rows[i],
  //                 j,
  //                 unitImages,
  //                 bookName
  //             );
  //             await Books.updateOne(
  //                 { nId: Number(rows[i][2]) },
  //                 {
  //                     $inc: { totalUnits: units.length },
  //                     $push: { units: { $each: units } },
  //                 }
  //             );
  //         }
  //         j++;
  //     }
  // }
}
