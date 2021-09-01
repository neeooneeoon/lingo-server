import { Collection, MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import { Sentence } from "@lingo/core/src/entities/sentence.entity";
import { GenerateQuestionInput } from "@lingo/tools/src/generated/types";
import { Question } from "@lingo/core/src/entities/question.entity";
import { PatternReader } from "./services/patternReader";
import { PatternsService } from "./services/patterns.service";
import { QUESTION_ENUM } from "./enums";
import { WordsService } from "./services/words.service";
import { SentencesService } from "./services/sentences.service";
import { getQuestionTypeCode } from "./helper";
import { Word } from "@lingo/core/src/entities/word.entity";

async function generateQuestions({
  words,
  sentences,
  allSentences,
  levelPatterns,
  labels,
  level,
  sentencesCollection,
}: GenerateQuestionInput & {
  sentencesCollection: Collection<Sentence>;
}) {
  const listQuestions: Question[] = [];
  let size = 0;
  const matchingCounter = {
    level: level,
    n: 0,
  };
  const isUsedSentences: Array<Sentence> = [];
  for (const pattern of levelPatterns) {
    const commandReader = new PatternReader(pattern);
    const questionMetaInfo = commandReader.extract();
    if (
      questionMetaInfo &&
      PatternsService.isInLabels(questionMetaInfo, labels)
    ) {
      switch (questionMetaInfo.group) {
        case QUESTION_ENUM.WORD:
          const wordQuestionParams = WordsService.getParamsFromPattern({
            pattern: questionMetaInfo,
            wordsIUnit: words,
            labels: labels,
            level: level,
            matchingCounter: matchingCounter,
          });
          if (wordQuestionParams?.length > 0) {
            for (const param of wordQuestionParams) {
              const question = WordsService.generateQuestion({
                ...param,
                questionId: `question${size}`,
              });
              if (question) {
                listQuestions.push(question);
                size++;
              } else {
                console.log({
                  type: questionMetaInfo.type,
                  group: questionMetaInfo.group,
                  word: questionMetaInfo.wordLabel,
                  sentence: questionMetaInfo.sentenceLabel,
                });
                console.log(labels);
              }
            }
          }
          break;
        case QUESTION_ENUM.SENTENCE:
          if (questionMetaInfo && questionMetaInfo.type !== 19) {
            if (questionMetaInfo && questionMetaInfo.wordLabel !== "x") {
              const sentenceQuestionParams =
                SentencesService.getParamsFromPattern({
                  pattern: questionMetaInfo,
                  wordsIUnit: words,
                  labels: labels,
                  level: level,
                  matchingCounter: matchingCounter,
                });
              if (sentenceQuestionParams?.length > 0) {
                for (const param of sentenceQuestionParams) {
                  const focusSentence = sentences.find(
                    (element) => element._id === param.sentenceId
                  );
                  if (focusSentence) {
                    const question = await SentencesService.generateQuestion({
                      type: param.type,
                      sentencesInUnit: sentences,
                      focusSentence: focusSentence,
                      allSentences: allSentences,
                      questionId: `question${size}`,
                      sentencesCollection: sentencesCollection,
                    });
                    if (question) {
                      listQuestions.push(question);
                      size++;
                    } else {
                      console.log({
                        type: questionMetaInfo.type,
                        group: questionMetaInfo.group,
                        word: questionMetaInfo.wordLabel,
                        sentence: questionMetaInfo.sentenceLabel,
                      });
                      console.log(labels);
                    }
                  } else {
                    console.log(`Sentence not found ${param.sentenceId}`);
                  }
                }
              }
            } else {
              const questionCode = getQuestionTypeCode(
                QUESTION_ENUM.SENTENCE,
                questionMetaInfo.type
              );
              const sortedSentences = Array.from(sentences).sort((s1, s2) => {
                return s1.content.length <= s2.content.length ? -1 : 1;
              });
              for (const sentence of sortedSentences) {
                if (isUsedSentences.length >= 8) break;
                const index = isUsedSentences.findIndex(
                  (el) => el.baseId === sentence.baseId
                );
                if (index == -1) {
                  isUsedSentences.push(sentence);
                }
              }
              let position =
                questionMetaInfo.sentenceLabel[1] == "0"
                  ? 0
                  : parseInt(questionMetaInfo.sentenceLabel[1]) - 1;
              if (questionMetaInfo.type === 18) {
                position += 3;
              }
              if (isUsedSentences[position]) {
                listQuestions.push({
                  _id: `question${size}`,
                  choices: [],
                  code: questionCode,
                  focus: isUsedSentences[position]._id,
                  hiddenIndex: isUsedSentences[position].wordBaseIndex,
                });
                size++;
              }
            }
          }
        default:
          break;
      }
    }
  }
  return listQuestions;
}
async function run() {
  const result = dotenv.config();
  if (result.error) {
    throw new Error("Environments variables is not config");
  } else {
    const envConfig = result.parsed;
    if (envConfig) {
      const dbUrl = envConfig.DB_URL;
      const dbName = envConfig.DB_NAME;
      const client = new MongoClient(dbUrl, { useUnifiedTopology: true });
      await client.connect();
      const database = client.db(dbName);
      const sentencesCollection = database.collection<Sentence>("sentences");
      const wordsCollection = database.collection<Word>("words");
      await client.close();
    }
  }
}

run().catch((e) => {
  throw e;
});
