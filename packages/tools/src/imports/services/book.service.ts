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
}
