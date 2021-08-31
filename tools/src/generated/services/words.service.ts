import { Collection } from 'mongodb';
import { Word } from '@entities/word.entity';

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
}
