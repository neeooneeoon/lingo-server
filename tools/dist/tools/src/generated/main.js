"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const dotenv = require("dotenv");
const patternReader_1 = require("./services/patternReader");
const patterns_service_1 = require("./services/patterns.service");
const enums_1 = require("./enums");
const words_service_1 = require("./services/words.service");
const sentences_service_1 = require("./services/sentences.service");
const helper_1 = require("./helper");
function generateQuestions({ words, sentences, allSentences, levelPatterns, labels, level, sentencesCollection, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const listQuestions = [];
        let size = 0;
        const matchingCounter = {
            level: level,
            n: 0,
        };
        const isUsedSentences = [];
        for (const pattern of levelPatterns) {
            const commandReader = new patternReader_1.PatternReader(pattern);
            const questionMetaInfo = commandReader.extract();
            if (questionMetaInfo &&
                patterns_service_1.PatternsService.isInLabels(questionMetaInfo, labels)) {
                switch (questionMetaInfo.group) {
                    case enums_1.QUESTION_ENUM.WORD:
                        const wordQuestionParams = words_service_1.WordsService.getParamsFromPattern({
                            pattern: questionMetaInfo,
                            wordsIUnit: words,
                            labels: labels,
                            level: level,
                            matchingCounter: matchingCounter,
                        });
                        if ((wordQuestionParams === null || wordQuestionParams === void 0 ? void 0 : wordQuestionParams.length) > 0) {
                            for (const param of wordQuestionParams) {
                                const question = words_service_1.WordsService.generateQuestion(Object.assign(Object.assign({}, param), { questionId: `question${size}` }));
                                if (question) {
                                    listQuestions.push(question);
                                    size++;
                                }
                                else {
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
                    case enums_1.QUESTION_ENUM.SENTENCE:
                        if (questionMetaInfo && questionMetaInfo.type !== 19) {
                            if (questionMetaInfo && questionMetaInfo.wordLabel !== 'x') {
                                const sentenceQuestionParams = sentences_service_1.SentencesService.getParamsFromPattern({
                                    pattern: questionMetaInfo,
                                    wordsIUnit: words,
                                    labels: labels,
                                    level: level,
                                    matchingCounter: matchingCounter,
                                });
                                if ((sentenceQuestionParams === null || sentenceQuestionParams === void 0 ? void 0 : sentenceQuestionParams.length) > 0) {
                                    for (const param of sentenceQuestionParams) {
                                        const focusSentence = sentences.find((element) => element._id === param.sentenceId);
                                        if (focusSentence) {
                                            const question = yield sentences_service_1.SentencesService.generateQuestion({
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
                                            }
                                            else {
                                                console.log({
                                                    type: questionMetaInfo.type,
                                                    group: questionMetaInfo.group,
                                                    word: questionMetaInfo.wordLabel,
                                                    sentence: questionMetaInfo.sentenceLabel,
                                                });
                                                console.log(labels);
                                            }
                                        }
                                        else {
                                            console.log(`Sentence not found ${param.sentenceId}`);
                                        }
                                    }
                                }
                            }
                            else {
                                const questionCode = helper_1.getQuestionTypeCode(enums_1.QUESTION_ENUM.SENTENCE, questionMetaInfo.type);
                                const sortedSentences = Array.from(sentences).sort((s1, s2) => {
                                    return s1.content.length <= s2.content.length ? -1 : 1;
                                });
                                for (const sentence of sortedSentences) {
                                    if (isUsedSentences.length >= 8)
                                        break;
                                    const index = isUsedSentences.findIndex((el) => el.baseId === sentence.baseId);
                                    if (index == -1) {
                                        isUsedSentences.push(sentence);
                                    }
                                }
                                let position = questionMetaInfo.sentenceLabel[1] == '0'
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
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = dotenv.config();
        if (result.error) {
            throw new Error('Environments variables is not config');
        }
        else {
            const envConfig = result.parsed;
            if (envConfig) {
                const dbUrl = envConfig.DB_URL;
                const dbName = envConfig.DB_NAME;
                const client = new mongodb_1.MongoClient(dbUrl, { useUnifiedTopology: true });
                yield client.connect();
                const database = client.db(dbName);
                const sentencesCollection = database.collection('sentences');
                const wordsCollection = database.collection('words');
                yield client.close();
            }
        }
    });
}
run().catch((e) => {
    throw e;
});
//# sourceMappingURL=main.js.map