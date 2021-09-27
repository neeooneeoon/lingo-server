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
  const questionHolders = await qhCollections
    .find({
      bookId: {
        $in: ['tienganh7tap1demo', 'tienganh10tap2demo', 'tienganh3tap1demo'],
      },
    })
    .toArray();

  for (const qh of questionHolders) {
    const questions: any[] = qh.questions;
    for (let i = 0; i < questions.length; i++) {
      questions[i]._id = `question${i}`;
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
