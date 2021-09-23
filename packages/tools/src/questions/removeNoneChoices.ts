import * as dotenv from 'dotenv';
import { MongoClient, ObjectID } from 'mongodb';

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
  const qhCollections = database.collection('questionholders');
  const questionHolders = await qhCollections.find({}).toArray();

  for (const qh of questionHolders) {
    const questions: any[] = qh.questions;
    for (let i = 0; i < questions.length; i++) {
      if (questions[i].choices?.length > 0) {
        const choices = new Array(...questions[i].choices).filter(
          (element) => element._id?.trim() !== '',
        );
        questions[i].choices = choices;
      }
    }
    await qhCollections.updateOne(
      {
        _id: new ObjectID(qh._id),
      },
      {
        $set: {
          questions: questions,
        },
      },
    );
  }
  await client.close();
}
run();
