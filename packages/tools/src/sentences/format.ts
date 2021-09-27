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
  await client.connect();
  console.log('Connected');
  const database = client.db(dbName);
  const sentencesCollection = database.collection('sentences');
  const sentences = await sentencesCollection.find().toArray();
  await Promise.all(
    sentences.map((el) => {
      const contentSplit = el.contentSplit.filter((el) => el?.text);
      const translateSplit = el.translateSplit.filter((el) => el?.text);
      return sentencesCollection.updateOne(
        { _id: el._id },
        {
          $set: {
            audio: el.audio.trim(),
            content: el.content.trim(),
            translate: el.translate.trim(),
            contentSplit: contentSplit,
            translateSplit: translateSplit,
          },
        },
      );
    }),
  );
  await client.close();
}

run();
