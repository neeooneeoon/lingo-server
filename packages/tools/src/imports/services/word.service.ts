import { Collection } from 'mongodb';
import { WordSmoothingParam, WordInSheet } from '../types';
import { wordClassification } from '@lingo/tools/src/helpers';
import fs from 'fs';
import path from 'path';

export class WordsService {
  private readonly wordsCollection: Collection<any>;

  constructor(_collection: Collection<any>) {
    this.wordsCollection = _collection;
  }

  public async smoothingFromSheet(params: WordSmoothingParam[]) {
    const words: WordInSheet[] = [];
    params.forEach((element) => {
      if (element.contentCol && element.meaningCol) {
        const signature = element.signature
          .replace(/[\!\@\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\~\_\n]/g, '')
          .toUpperCase()
          .trim();
        const classify = wordClassification(signature);
        const pronunciations = [
          element.pronunciationCol.replace(/[\n]/g, '').trim(),
        ];
        const meanings = [element.meaningCol.replace(/[\n]/g, '').trim()];
        const word: WordInSheet = {
          _id: element.wordIdCol,
          meaning: meanings[0],
          meanings: meanings,
          pronunciations: pronunciations,
          types: classify ? [classify] : [],
          haveImageWords: [],
          noImageWords: [],
          bookNId: element.bookNIdCol,
          unitNId: element.unitNIdCol,
          content: element.contentCol.replace(/[\n]/g, '').trim(),
          imageRoot: element.imageRootCol,
          isUseToMakeQuestion: true,
        };
        words.push(word);
      }
    });
    await this.wordsCollection.deleteMany({
      bookNId: params[0].bookNIdCol,
      unitNId: params[0].unitNIdCol,
    });
    await this.wordsCollection.insertMany(words);
    // const destinationFile = path.join(__dirname, 'wordDemo.json');
    // fs.writeFileSync(destinationFile, JSON.stringify(words));
    // console.log(words.length);
  }
}
