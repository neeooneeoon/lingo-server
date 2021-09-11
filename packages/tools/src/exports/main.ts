import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { QuestionHolder } from '@lingo/core/src/entities/questionHolder.entity';
import { Sentence } from '@lingo/core/src/entities/sentence.entity';
import { Word } from '@lingo/core/src/entities/word.entity';
import { Book } from '@lingo/core/src/entities/book.entity';
import { QuestionService } from './services/question.service';
import * as fs from 'fs';
import {
  GoogleAuthorization,
  GoogleSpreadsheetService,
} from '../google/services';
import { UnitDemo } from './services/unitDemo.service';

async function run() {
  const result = dotenv.config();
  if (result.error) {
    throw new Error('Environments variables is not config');
  } else {
    const envConfig = result.parsed;
    const dbUrl = envConfig.DB_URL;
    const dbName = envConfig.DB_NAME;
    const client = new MongoClient(dbUrl, { useUnifiedTopology: true });
    try {
      await client.connect();
      console.log('Connected.');
      const database = client.db(dbName);
      const questionHoldersCollection =
        database.collection<QuestionHolder>('questionholders');
      const sentencesCollection = database.collection<Sentence>('sentences');
      const wordsCollection = database.collection<Word>('words');
      const booksCollection = database.collection<Book>('books');
      const books = await booksCollection
        .find(
          { _id: 'tienganh2ctgdpt2018' },
          { projection: { _id: 1, name: 1 } },
        )
        .sort({ nId: 1 })
        .toArray();
      const questionsService = new QuestionService(
        questionHoldersCollection,
        sentencesCollection,
        wordsCollection,
      );
      const listItems = await questionsService.getMultipleChoiceQuestions(
        books,
      );
      const spreadsheetId = envConfig.QUESTION_REPORT;
      const auth = await GoogleAuthorization.authorize();
      const googleSpreadsheetService = new GoogleSpreadsheetService(
        spreadsheetId,
        auth,
      );
      for (const item of listItems.slice(1)) {
        const sheetName = Object.keys(item)[0];
        const data = [
          [
            'BOOKID',
            'UNITID',
            'LEVEL',
            'QUESTIONID',
            'MÔ TẢ',
            'TỪ/ CÂU GỐC',
            'TỪ ẨN TRONG CÂU',
            'ĐÁP ÁN NHIỄU',
            'ID TỪ/ CÂU GỐC',
            'CODE',
          ],
          ...item[sheetName],
        ];
        await googleSpreadsheetService.clearAll(sheetName);
        await googleSpreadsheetService.writeAll(sheetName, data);
      }
      fs.writeFileSync('./export.json', JSON.stringify(listItems.slice(1)));
    } catch (e) {
      console.log(e);
    } finally {
      await client.close();
    }
  }
}

async function vocabularyWithoutSound() {
  const result = dotenv.config();
  if (result.error) {
    throw result.error;
  } else {
    const envConfig = result.parsed;
    const spreadsheetId = envConfig.DATA_DEMO;
    const auth = await GoogleAuthorization.authorize();
    const spreadsheetService = new GoogleSpreadsheetService(
      spreadsheetId,
      auth,
    );
    const SHEET_NAME = 'Tiếng Anh 3 (Unit 10-demo) Mới';
    const listSheetNames = ['Tiếng Anh 3 (Unit 10-demo) Mới'];
    const unitDemo = new UnitDemo(spreadsheetService, SHEET_NAME);
    await unitDemo.vocabularyWithoutSound();
  }
}

// run().then();
vocabularyWithoutSound().then();
