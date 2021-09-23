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
  const sentencesCollection = database.collection('sentences');

  const [words, sentences] = await Promise.all([
    wordsCollection.find().toArray(),
    sentencesCollection.find().toArray(),
  ]);
  const wordsContent = words.map((element) => element.content);
  const wordsInSentence = sentences
    .map((element) => {
      const contentSplit = element.contentSplit;
      return contentSplit.map((element) => {
        return element.text;
      });
    })
    .flat();
  const regex = new RegExp(
    /[\!\@\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\|\~\`\_\?\,]/g,
  );
  const deepRegex = new RegExp(
    /[\!\@\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\|\~\`\_\?\,\“\”\’\"\']/g,
  );

  function findWordsNoAudio(setWords: string[], sourcePath: string) {
    const data = new Set<string>();
    const files = fs.readFileSync(path.join(__dirname, sourcePath), {
      encoding: 'utf8',
    });
    setWords.forEach((element: string) => {
      let formattedContent = element.replaceAll(regex, '').toLowerCase().trim();
      const length = formattedContent.length;
      const firstChar = formattedContent[0];
      const latestChar = formattedContent[length - 1];
      if (firstChar && firstChar.match(deepRegex)) {
        formattedContent = formattedContent.slice(1);
      }
      if (latestChar && latestChar.match(deepRegex)) {
        const limit = formattedContent.length - 1;
        formattedContent = formattedContent.slice(0, limit);
      }
      if (!formattedContent.match(/^[0-9]+$/)) {
        const md5Hashed = md5(formattedContent);
        if (!files.includes(md5Hashed)) {
          data.add(formattedContent.trim());
        }
      }
    });
    return [...data];
  }

  const noAudioDict2 = findWordsNoAudio(
    [...new Set<string>(wordsContent)],
    'data/dict2Audio.txt',
  );
  const noAudioDict3 = findWordsNoAudio(
    [...new Set<string>(wordsInSentence)],
    'data/dict3Audio.txt',
  );

  const mergeSet = new Set<string>([...noAudioDict2, ...noAudioDict3]);
  // const destination = path.join(__dirname, 'data/noAudio.json');
  // fs.writeFileSync(destination, JSON.stringify([...combined]));
  const writeData = [...mergeSet].map((element) => [element]);
  const SPREADSHEET_ID = envConfig.DATA_DEMO;
  const SHEET_NAME = 'Từ Thiếu Âm Thanh';
  const auth = await GoogleAuthorization.authorize();
  const spreadsheetService = new GoogleSpreadsheetService(SPREADSHEET_ID, auth);
  await spreadsheetService.clearAll(SHEET_NAME);
  await spreadsheetService.writeAll(SHEET_NAME, writeData);
  await client.close();
}

exportWordsNoSound();
