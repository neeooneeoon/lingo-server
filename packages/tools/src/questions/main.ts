import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { QuestionTypeCode } from '@lingo/core/src/utils/enums';
import { QuestionHolderDocument } from '@lingo/core/src/entities/questionHolder.entity';
import { WordDocument } from '@lingo/core/src/entities/word.entity';
import { SentenceDocument } from '@lingo/core/src/entities/sentence.entity';

async function run() {
  const result = dotenv.config();
  if (result.error) {
    throw result.error;
  } else {
    const envConfig = result.parsed;
    const dbUrl = envConfig.DB_URL;
    const dbName = envConfig.DB_NAME;
    const client = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await client.connect();
    console.log('Connected.');
    const database = client.db(dbName);
    const questionHoldersCol =
      database.collection<QuestionHolderDocument>('questionholders');
    const wordsCol = database.collection<WordDocument>('words');
    const sentencesCol = database.collection<SentenceDocument>('sentences');
    const questionHolders = await questionHoldersCol.find().toArray();
    const codes = [
      QuestionTypeCode.W3,
      QuestionTypeCode.W6,
      QuestionTypeCode.W2,
      QuestionTypeCode.W4,
      QuestionTypeCode.W13,
      QuestionTypeCode.W9,
      QuestionTypeCode.S10,
      QuestionTypeCode.S7,
    ];
    for (const questionHolder of questionHolders) {
      const questions = questionHolder.questions;
      for (let i = 0; i < questions.length; i++) {
        const realAnswers: { _id: string; active: boolean }[] = [];
        if (
          questions[i].choices.length > 0 &&
          codes.includes(questions[i].code)
        ) {
          const choices = questions[i].choices;
          const realAnswers: { _id: string; active: boolean }[] = [];
          const group = [
            QuestionTypeCode.W3,
            QuestionTypeCode.W6,
            QuestionTypeCode.W2,
            QuestionTypeCode.W4,
            QuestionTypeCode.W13,
            QuestionTypeCode.W9,
          ].includes(questions[i].code)
            ? 'WORD'
            : 'SENTENCE';
          for (const choice of choices) {
            const index = realAnswers.findIndex((el) => el._id === choice._id);
            if (index === -1) {
              if (group === 'WORD') {
                const realWord = await wordsCol.findOne({
                  _id: choice._id,
                });
                if (realWord) {
                  realAnswers.push(choice);
                }
              } else {
                const realSentence = await sentencesCol.findOne({
                  _id: choice._id,
                });
                if (realSentence) {
                  realAnswers.push(choice);
                }
              }
            }
          }
        }
        questions[i].choices = realAnswers;
      }
      await questionHoldersCol.updateOne(
        {
          _id: questionHolder._id,
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
}

run().then();
