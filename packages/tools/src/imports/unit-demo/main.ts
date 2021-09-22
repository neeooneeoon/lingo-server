import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { SentenceService } from '@lingo/tools/src/imports/services';
import { WordsService } from '@lingo/tools/src/imports/services';
import { BookService } from '@lingo/tools/src/imports/services';
import { UnitService } from '@lingo/tools/src/imports/services';

import {
  GoogleAuthorization,
  GoogleSpreadsheetService,
} from '@lingo/tools/src/google/services';
import { SentenceSmoothingParam, WordSmoothingParam } from '../types';
import md5 from 'md5';

const main = async () => {
  const result = dotenv.config();
  if (result.error) {
    throw result.error;
  }
  const envConfig = result.parsed;

  const URI = envConfig.DB_URL;
  const DB_NAME = envConfig.DB_NAME;
  const SHEET_ID = envConfig.DATA_DEMO;

  const client = new MongoClient(URI, { useUnifiedTopology: true });
  await client.connect();
  const database = client.db(DB_NAME);
  const sentencesCollection = database.collection('sentences');
  const wordsCollection = database.collection('words');
  const booksCollection = database.collection('books');

  const auth = await GoogleAuthorization.authorize();
  const spreadsheetService = new GoogleSpreadsheetService(SHEET_ID, auth);
  const sentencesService = new SentenceService(sentencesCollection);
  const wordsService = new WordsService(wordsCollection);
  const booksService = new BookService(booksCollection);
  const unitsService = new UnitService(
    booksCollection,
    wordsCollection,
    sentencesCollection,
  );
  const demos = [
    // {
    //   bookNId: 4,
    //   unitNId: [3800],
    //   imageRoot: 'TA3-DEMO',
    //   sheetName: 'Tiếng Anh 3 (Unit 10-demo) Mới',
    // },
    // {
    //   bookNId: 12,
    //   unitNId: [6400, 6401],
    //   imageRoot: 'TA7-DEMO',
    //   sheetName: 'Tiếng Anh 7 (Unit 4-demo) Mới',
    // },
    {
      bookNId: 19,
      unitNId: [17700, 17701],
      imageRoot: 'TA10-DEMO',
      sheetName: 'Tiếng Anh 10 (Unit 10-demo) Mới',
    },
  ];

  const unitDemos = [
    // {
    //   bookName: 'Tiếng Anh 3 Tập 1 Demo',
    //   unitName: 'What do you do at break time?',
    //   bookNId: 4,
    //   unitNId: 3800,
    //   unitIndex: 1100,
    //   position: 10,
    // },
    // {
    //   bookName: 'Tiếng Anh 7 Tập 1 Demo',
    //   unitName: 'Music and arts',
    //   bookNId: 12,
    //   unitNId: 6400,
    //   unitIndex: 500,
    //   position: 4,
    // },
    {
      bookName: 'Tiếng Anh 10 Tập 2 Demo',
      bookNId: 19,
      unitName: 'Ecotourism',
      unitNId: 17700,
      unitIndex: 1300,
      position: 10,
    },
  ];

  const importDemoUnits = async (input: {
    bookName: string;
    unitName: string;
    bookNId: number;
    unitNId: number;
    unitIndex: number;
    position: number;
  }) => {
    const words = await wordsCollection
      .find({
        unitNId: input.unitNId,
        bookNId: input.bookNId,
      })
      .toArray();
    const sentences = await sentencesCollection
      .find({
        unitNId: input.unitNId,
        bookNId: input.bookNId,
      })
      .toArray();
    await unitsService.importDemoUnitToCurrentBooks(
      input.bookName,
      input.unitName,
      words,
      sentences,
      input.unitNId,
      input.unitIndex,
      input.position,
    );
  };
  //import units
  await Promise.all(unitDemos.map((input) => importDemoUnits(input)));
  //import books
  // await booksService.createDemoBooks();

  const closureFunc = async (input: {
    bookNId: number;
    unitNId: number[];
    imageRoot: string;
    sheetName: string;
  }) => {
    const SHEET_NAME = input.sheetName;
    const rows = await spreadsheetService.getSheet(SHEET_NAME);
    const usefulRowsSentences: SentenceSmoothingParam[] = [];
    const usefulRowsWords: WordSmoothingParam[] = [];
    const bookNId = input.bookNId;
    const unitNId = input.unitNId;
    const formatUsefulRows = () => {
      const HEADER_MAPPING = new Map<string, number>();
      HEADER_MAPPING.set('STT', 0);
      HEADER_MAPPING.set('UNIT', 1);
      HEADER_MAPPING.set('CONTENT', 2);
      HEADER_MAPPING.set('KINDOF', 3);
      HEADER_MAPPING.set('IMAGE', 4);
      HEADER_MAPPING.set('PHONETICS', 5);
      HEADER_MAPPING.set('MEANING', 6);
      HEADER_MAPPING.set('PHRASE', 7);
      HEADER_MAPPING.set('SENTENCES_CONTENT', 8);
      HEADER_MAPPING.set('SENTENCE_MEANING', 9);
      HEADER_MAPPING.set('AUDIO', 10);

      // await Promise.all(demos.map(()))

      rows.slice(3).forEach((row) => {
        if (row[2]) {
          const wordId = `${input.imageRoot}-`.concat(
            md5(row[HEADER_MAPPING.get('CONTENT')].trim()),
          );
          const sentenceParam: SentenceSmoothingParam = {
            baseIdCol: wordId,
            wordBaseCol: row[HEADER_MAPPING.get('CONTENT')],
            bookNIdCol: bookNId,
            unitNIdCol: unitNId,
            contentCol: row[HEADER_MAPPING.get('SENTENCES_CONTENT')],
            meaningCol: row[HEADER_MAPPING.get('SENTENCE_MEANING')],
            phraseCol: row[HEADER_MAPPING.get('PHRASE')],
            audioCol: row[HEADER_MAPPING.get('AUDIO')],
            grade: 3,
          };
          const wordParam: WordSmoothingParam = {
            wordIdCol: wordId,
            contentCol: row[HEADER_MAPPING.get('CONTENT')],
            meaningCol: row[HEADER_MAPPING.get('MEANING')],
            signature: row[HEADER_MAPPING.get('KINDOF')],
            pronunciationCol: row[HEADER_MAPPING.get('PHONETICS')],
            bookNIdCol: bookNId,
            unitNIdCol: unitNId,
            imageRootCol: row[4].replace(/[\n]/g, '').trim()
              ? input.imageRoot
              : '',
          };
          usefulRowsSentences.push(sentenceParam);
          usefulRowsWords.push(wordParam);
        }
      });
    };
    formatUsefulRows();
    await Promise.all([
      sentencesService.smoothingFromSheet(usefulRowsSentences),
      wordsService.smoothingFromSheet(usefulRowsWords),
    ]);
  };
  //import words, sentences
  // await Promise.all(demos.map((element) => closureFunc(element)));
  await client.close();
};

main().then();
