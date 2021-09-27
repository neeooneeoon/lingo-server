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
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  const spreadSheetId = envConfig.DATA_DEMO;
  const sheetName = 'BoundarySentences';
  await client.connect();
  console.log('Connected');
  const database = client.db(dbName);
  const sentencesCollection = database.collection('sentences');
  const auth = await GoogleAuthorization.authorize();
  const spreadsheetService = new GoogleSpreadsheetService(spreadSheetId, auth);
  const data = (await spreadsheetService.getSheet(sheetName)).filter(
    (el) => el?.length > 0,
  );
  for (const item of data.slice(0, -1)) {
    const sentenceId = item[0];
    const boundary = item[2].trim();
    if (boundary.toLocaleLowerCase() === 'all') {
      await sentencesCollection.updateOne(
        {
          _id: sentenceId,
        },
        {
          $set: {
            lowerBound: 0,
            upperBound: 0,
          },
        },
      );
      continue;
    }
    const [lower, upper] = boundary.split(',').map((el) => Number(el));
    if (Number.isInteger(lower) && Number.isInteger(upper)) {
      await sentencesCollection.updateOne(
        {
          _id: sentenceId,
        },
        {
          $set: {
            lowerBound: lower - 1,
            upperBound: upper - 1,
          },
        },
      );
    }
  }
  await client.close();
}

run();
