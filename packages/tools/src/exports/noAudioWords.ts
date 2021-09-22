import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import md5 from 'md5';
import path from 'path';
import fs from 'fs';
import {
  GoogleAuthorization,
  GoogleSpreadsheetService,
} from '@lingo/tools/src/google/services';

async function exportWordsNoSound() {
  const result = dotenv.config();
  if (result.error) {
    throw result.error;
  }
  const envConfig = result.parsed;
  const URI = envConfig.DB_URL;
  const DB_NAME = envConfig.DB_NAME;

  const client = new MongoClient(URI, { useUnifiedTopology: true });
  await client.connect();

  const database = client.db(DB_NAME);
  const wordsCollection = database.collection('words');

  const words = await wordsCollection
    .find({ _id: 'TA10-DEMO-8cb554127837a4002338c10a299289fb' })
    .toArray();
  const SHEET_ID = '1GI8UHxNSt0-sPlq_u0lkW3cOnrfgR78vuTml78e_Pnw';
  const SHEET_NAME = 'Từ Thiếu Âm Thanh';
  const auth = await GoogleAuthorization.authorize();
  const spreadsheetService = new GoogleSpreadsheetService(SHEET_ID, auth);
  const data: string[][] = [];
  const dataPath = path.join(__dirname, './data/manh.txt');
  fs.readFile(dataPath, { encoding: 'utf8' }, (err, files) => {
    words.forEach((element) => {
      const encode = md5(element.content).concat('.mp3');
      if (!files.includes(encode)) {
        data.push([element.content]);
      }
    });
  });
  // await spreadsheetService.clearAll(SHEET_NAME);
  await spreadsheetService.writeAll(SHEET_NAME, data);
  await client.close();
}

exportWordsNoSound();
