import { getID } from '@lingo/tools/src/helpers';
import { Collection } from 'mongodb';
export class BookService {
  private readonly booksCollection: Collection<any>;

  constructor(_collection: Collection<any>) {
    this.booksCollection = _collection;
  }

  public async removeUnits() {
    const bookIds = ['tienganh3tap1', 'tienganh7tap1', 'tienganh10tap2'];
    const regexUnitIds = [
      /^whatdoyoudoatbreaktime/,
      /^musicandarts/,
      /^ecotourism/,
    ];
    await this.booksCollection.updateMany(
      { _id: { $in: bookIds } },
      {
        $pull: {
          units: {
            $or: [
              { _id: { $regex: regexUnitIds[0] } },
              { _id: { $regex: regexUnitIds[1] } },
              { _id: { $regex: regexUnitIds[2] } },
            ],
          },
        },
      },
    );
  }

  public async createDemoBooks() {
    const english3 = {
      _id: getID('Tiếng Anh 3 Tập 1 Demo'),
      description: '',
      totalWords: 0,
      totalSentences: 0,
      totalUnits: 0,
      totalLessons: 0,
      totalQuestions: 0,
      nId: 4,
      cover: 'https://s.sachmem.vn/public/bookcovers/TA3T1SHS_head.jpg',
      grade: 3,
      name: 'Tiếng Anh 3 Tập 1 Demo',
      number: 5,
      imgName: 'TA3-DEMO',
      units: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const english7 = {
      _id: getID('Tiếng Anh 7 Tập 1 Demo'),
      description: '',
      totalWords: 0,
      totalSentences: 0,
      totalUnits: 0,
      totalLessons: 0,
      totalQuestions: 0,
      nId: 12,
      cover: 'https://s.sachmem.vn/public//bookcovers/TA7T1SHS_head.jpg',
      grade: 7,
      name: 'Tiếng Anh 7 Tập 1 Demo',
      number: 13,
      imgName: 'TA7-DEMO',
      units: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const english10 = {
      _id: getID('Tiếng Anh 10 Tập 2 Demo'),
      description: '',
      totalWords: 0,
      totalSentences: 0,
      totalUnits: 0,
      totalLessons: 0,
      totalQuestions: 0,
      nId: 19,
      cover: 'https://s.sachmem.vn/public/bookcovers/TA10T2SHS_head.jpg',
      grade: 10,
      name: 'Tiếng Anh 10 Tập 2 Demo',
      number: 20,
      imgName: 'TA10-DEMO',
      units: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.booksCollection.insertMany([english3, english7, english10]);
  }
}
