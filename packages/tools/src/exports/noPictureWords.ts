import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import axios from 'axios';
import {
  GoogleAuthorization,
  GoogleSpreadsheetService,
} from '@lingo/tools/src/google/services';

async function exportWordsNoPicture() {
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
  const [words] = await Promise.all([wordsCollection.find().toArray()]);

  const wordsList = words.map((e) => ({
    content: e.content,
    root: e.imageRoot,
  }));

  wordsList.forEach((e) => {
    if (e.root[0] == '/') {
      e.root = e.root.substring(1);
    }
    e.root = e.root.replace(/ /g, '%20');
    e.content = e.content.replace(/ /g, '%20');
  });

  const data: string[][] = [];

  for (let i = 0; i < wordsList.length; i++) {
    let url: string;
    if (!wordsList[i].root) {
      url =
        'https://s.sachmem.vn/public/dics_stable/' +
        wordsList[i].content +
        '.jpg';
    } else {
      url =
        'https://s.sachmem.vn/public/dics_stable/' +
        wordsList[i].root +
        '/' +
        wordsList[i].content +
        '.jpg';
    }

    try {
      const request = await axios.get(url);
      console.log(wordsList[i].content.replace(/(%20)/g, ' ') + " ok");
    } catch (exception) {
      if (exception) {
        data.push([wordsList[i].content.replace(/(%20)/g, ' '), url]);
        console.log(wordsList[i].content.replace(/(%20)/g, ' ') + " " + url);
      }
    }
  }

  const SPREADSHEET_ID = envConfig.DATA_DEMO;
  const SHEET_NAME = 'Từ Thiếu Ảnh';
  const auth = await GoogleAuthorization.authorize();
  const spreadsheetService = new GoogleSpreadsheetService(SPREADSHEET_ID, auth);
  await spreadsheetService.clearAll(SHEET_NAME);
  await spreadsheetService.writeAll(SHEET_NAME, data);

  await client.close();
}

exportWordsNoPicture();
