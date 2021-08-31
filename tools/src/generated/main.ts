import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import { Sentence } from '@entities/sentence.entity';
import { PunctuationService } from './services/punctuation.service';

async function run() {
  const result = dotenv.config();
  if (result.error) {
    throw new Error('Environments variables is not config');
  } else {
    const envConfig = result.parsed;
    const dbUrl = envConfig.DB_URL;
    const dbName = envConfig.DB_NAME;
    const client = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await client.connect();
    const database = client.db(dbName);
    const sentences = database.collection<Sentence>('sentences');
    const listSentences = await sentences.find().toArray();
    for (const sentence of listSentences) {
      const punctuationRegex = /[“”"’'!,?.]/g;
      const punctuations: Array<string> = [];
      const content = sentence.content.trim();
      for (const c of content) {
        if (punctuationRegex.test(c)) {
          punctuations.push(c);
        }
      }
      if (punctuations.length > 0) {
        const service = new PunctuationService(punctuations, sentence);
        await service.similarityStories(sentences);
      }
    }
    await client.close();
  }
}

run().catch((e) => {
  throw e;
});
