import {
  GoogleAuthorization,
  GoogleSpreadsheetService,
} from '@lingo/tools/src/google/services';
import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

async function run() {
  const result = dotenv.config();
  if (result.error) {
    throw result.error;
  } else {
    const envConfig = result.parsed;
    const spreadsheetId = envConfig.DATA_DEMO;
    const dbUrl = envConfig.DB_URL;
    const dbName = envConfig.DB_NAME;
    const client = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await client.connect();
    console.log('Connected.');
    const database = client.db(dbName);
    await Promise.all([
      database.collection('wordtests').drop(),
      database.collection('sentencetests').drop(),
    ]);
    const auth = await GoogleAuthorization.authorize();
    const spreadsheetService = new GoogleSpreadsheetService(
      spreadsheetId,
      auth,
    );
    let sheetData = await spreadsheetService.getSheet(
      'Tiếng Anh 3 (Unit 10-demo) Mới',
    );
    const wordData: any[] = [];
    const sentenceData: any[] = [];
    sheetData = sheetData.slice(3);
    sheetData.forEach((element) => {
      wordData.push({
        content: element[2].replace('\n', '').trim(),
        image: element[3].replace('\n', '').trim(),
        pronunciations: element[4].split('|'),
        meaning: element[5].split('|')[0].replace('\n', '').trim(),
        meanings: element[5].split('|'),
        sheetName: 'Tiếng Anh 3 (Unit 10-demo) Mới',
      });
      const sentences = element[7].split('\n');
      if (sentences?.length > 0) {
        const phrases = element[6].split('\n');
        const sentenceMeanings = element[9]?.split('\n');
        const sentenceImages = element[8]?.split('\n');
        sentences.forEach((element, index) => {
          if (element) {
            sentenceData.push({
              content: element,
              translates:
                sentenceMeanings && sentenceMeanings[index]
                  ? [sentenceMeanings[index]]
                  : [],
              translate:
                sentenceMeanings && sentenceMeanings[index]
                  ? sentenceMeanings[index]
                  : '',
              phrase: phrases[index] ? phrases[index] : '',
              image:
                sentenceImages && sentenceImages[index]
                  ? sentenceImages[index]
                  : '',
              sheetName: 'Tiếng Anh 3 (Unit 10-demo) Mới',
            });
          }
        });
      }
    });
    await Promise.all([
      database.collection('wordtests').insertMany(wordData),
      database.collection('sentencetests').insertMany(sentenceData),
    ]);
    await client.close();
  }
}

run().then();
