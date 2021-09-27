import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import {
  GoogleAuthorization,
  GoogleSpreadsheetService,
} from '../google/services';

async function run() {
  const result = dotenv.config();
  if (result.error) {
    throw result.error;
  }
  const envConfig = result.parsed;
  const uri = envConfig.DB_URL;
  const dbName = envConfig.DB_NAME;
  const SPREADSHEET_ID = envConfig.DATA_DEMO;
  const SHEET_NAME = 'BoundarySentences';

  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  console.log('Connected');

  const database = client.db(dbName);
  const sentencesCollection = database.collection('sentences');
  const auth = await GoogleAuthorization.authorize();
  const spreadsheetService = new GoogleSpreadsheetService(SPREADSHEET_ID, auth);
  const sentences = await sentencesCollection
    .find({
      bookNId: {
        $in: [40, 120, 190],
      },
    })
    .toArray();
  const data: string[][] = [];
  sentences.forEach((sentence) => {
    if (sentence?.lowerBound !== 0 && sentence?.upperBound !== 0) {
      const contentSplit: string[] = sentence.contentSplit.map((el) => el.text);
      data.push([sentence._id, contentSplit.toString()]);
    }
  });
  await spreadsheetService.clearAll(SHEET_NAME);
  await spreadsheetService.writeAll(SHEET_NAME, data);
  await client.close();
}

run();
