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
exports.SentencesService = void 0;
const helper_1 = require("tools/src/generated/helper");
const enums_1 = require("tools/src/generated/enums");
const punctuation_service_1 = require("./punctuation.service");
class SentencesService {
    constructor(_sentencesCollection) {
        this.sentencesCollection = _sentencesCollection;
    }
    sentencesInUnit(bookNId, unitNId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sentencesCollection
                .find({
                bookNId: bookNId,
                unitNId: unitNId,
            })
                .toArray();
        });
    }
    sentencesInBook(bookNId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sentencesCollection
                .find({
                bookNId: bookNId,
            })
                .toArray();
        });
    }
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sentencesCollection.find().toArray();
        });
    }
    static generateQuestion({ type, focusSentence, sentencesInUnit, allSentences, questionId, sentencesCollection, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const questionCode = helper_1.getQuestionTypeCode(enums_1.QUESTION_ENUM.SENTENCE, type);
            let question = null;
            try {
                switch (type) {
                    case 1:
                    case 2:
                    case 12:
                    case 17:
                        if (type === 1 && !focusSentence.audio) {
                            console.log('No audio');
                            return null;
                        }
                        else if (type === 12 && focusSentence.translateSplit.length <= 10) {
                            question = Object.assign(Object.assign({}, question), { _id: questionId, choices: [], hiddenIndex: -1, code: questionCode, focus: focusSentence._id, wordId: focusSentence.baseId });
                        }
                        else if (type !== 12) {
                            question = Object.assign(Object.assign({}, question), { _id: questionId, choices: [], hiddenIndex: -1, code: questionCode, focus: focusSentence._id });
                        }
                        return question;
                    case 7:
                        if (focusSentence.wordBaseIndex === -1)
                            return null;
                        if (focusSentence.baseId) {
                            question = Object.assign(Object.assign({}, question), { _id: questionId, focus: focusSentence._id, hiddenIndex: focusSentence.wordBaseIndex, choices: [], code: questionCode, wordId: focusSentence.baseId });
                        }
                        return question;
                    case 10:
                        if (sentencesInUnit.length >= 2) {
                            const punctuationRegex = /[“”"’'!,?.]/g;
                            const punctuations = [];
                            const content = focusSentence.content.trim();
                            for (const c of content) {
                                if (punctuationRegex.test(c)) {
                                    punctuations.push(c);
                                }
                            }
                            if (punctuations.length > 0) {
                                const punctuationService = new punctuation_service_1.PunctuationService(punctuations, focusSentence, sentencesCollection);
                                const distractedSentences = punctuationService.similaritySentences(allSentences);
                                const distractedStories = yield punctuationService.similarityStories();
                                distractedSentences.push(...distractedStories);
                                const activeChoices = distractedSentences.map((element) => ({
                                    _id: element,
                                    active: true,
                                }));
                                if (activeChoices.length > 0) {
                                    question = Object.assign(Object.assign({}, question), { _id: questionId, choices: activeChoices, focus: focusSentence._id, hiddenIndex: -1, code: questionCode });
                                }
                                else {
                                    const activeChoices = sentencesInUnit
                                        .filter((element) => element._id !== focusSentence._id)
                                        .map((element) => ({
                                        _id: element._id,
                                        active: true,
                                    }));
                                    question = Object.assign(Object.assign({}, question), { _id: questionId, code: questionCode, choices: activeChoices, focus: focusSentence._id, hiddenIndex: -1 });
                                }
                            }
                            else {
                                console.log(`${focusSentence._id} - ${focusSentence.content}`);
                            }
                        }
                        return question;
                    case 14:
                    case 15:
                    case 16:
                        if (type === 14 && focusSentence.audio) {
                            question = Object.assign(Object.assign({}, question), { _id: questionId, focus: focusSentence._id, hiddenIndex: focusSentence.wordBaseIndex, choices: [], code: questionCode });
                        }
                        else if (type === 15) {
                            if (focusSentence.wordBaseIndex !== -1) {
                                question = Object.assign(Object.assign({}, question), { _id: questionId, focus: focusSentence._id, hiddenIndex: focusSentence.wordBaseIndex, choices: [], code: questionCode });
                            }
                        }
                        else if (type === 16) {
                            question = Object.assign(Object.assign({}, question), { _id: questionId, focus: focusSentence._id, hiddenIndex: -1, choices: [], code: questionCode });
                        }
                        return question;
                    case 18:
                        question = Object.assign(Object.assign({}, question), { _id: questionId, focus: focusSentence._id, hiddenIndex: focusSentence.wordBaseIndex, choices: [], code: questionCode });
                        return question;
                    case 4:
                        question = Object.assign(Object.assign({}, question), { _id: questionId, focus: focusSentence._id, hiddenIndex: -1, choices: [], code: questionCode });
                        return question;
                    default:
                        return question;
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    static getParamsFromPattern(input) {
        const indexes = (function () {
            const result = [];
            input.labels.forEach((element, index) => {
                if (element === input.pattern.wordLabel)
                    result.push(index);
            });
            return result;
        })();
        return indexes.map((el) => {
            var _a, _b, _c;
            return {
                type: input.pattern.type,
                wordId: (_a = input.wordsIUnit[el]) === null || _a === void 0 ? void 0 : _a._id,
                sentenceId: input.pattern.sentenceLabel[1] === '0'
                    ? (_b = input.wordsIUnit[el]) === null || _b === void 0 ? void 0 : _b._id.concat('S0')
                    : ((_c = input.wordsIUnit[el]) === null || _c === void 0 ? void 0 : _c._id.concat('S')) +
                        (parseInt(input.pattern.sentenceLabel[1]) - 1),
            };
        });
    }
}
exports.SentencesService = SentencesService;
//# sourceMappingURL=sentences.service.js.map