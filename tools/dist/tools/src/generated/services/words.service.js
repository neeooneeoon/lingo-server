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
exports.WordsService = void 0;
const enums_1 = require("tools/src/generated/enums");
const helper_1 = require("tools/src/generated/helper");
const enums_2 = require("@utils/enums");
class WordsService {
    constructor(_wordsCollection) {
        this.wordsCollection = _wordsCollection;
    }
    wordsInUnit(bookNId, unitNId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.wordsCollection
                .find({
                bookNId: bookNId,
                unitNId: unitNId,
            })
                .toArray();
        });
    }
    static getParamsFromPattern(input) {
        if (input.pattern.type !== 9) {
            return input.labels
                .map((label, index) => {
                if (label === input.pattern.wordLabel) {
                    return {
                        type: input.pattern.type,
                        wordsIUnit: input.wordsIUnit,
                        focusId: input.wordsIUnit[index]._id,
                        matchingLabels: [],
                    };
                }
            })
                .filter((el) => el);
        }
        else {
            const labelsCloned = Array.from(input.labels);
            const matchingLabelMatrix = [];
            const paramResults = [];
            while (true) {
                const matchingLabels = [];
                for (const label of input.pattern.matchingLabels) {
                    const labelIndex = labelsCloned.indexOf(label);
                    if (labelIndex !== -1) {
                        matchingLabels.push(labelIndex);
                        labelsCloned[labelIndex] = undefined;
                    }
                }
                if (matchingLabels.length > 0) {
                    matchingLabelMatrix.push(matchingLabels);
                }
                else {
                    break;
                }
            }
            if (matchingLabelMatrix.length > 0) {
                for (const row of matchingLabelMatrix) {
                    if (row.length > 0) {
                        const contentSet = new Set();
                        const meaningSet = new Set();
                        const wordIdSet = new Set();
                        for (const value of row) {
                            const matchingWord = input.wordsIUnit[value];
                            if (matchingWord) {
                                const matchingContent = matchingWord.content
                                    .trim()
                                    .toLowerCase()
                                    .normalize('NFKD');
                                const matchingMeaning = matchingWord.meaning
                                    .trim()
                                    .toLowerCase()
                                    .normalize('NFKD');
                                if (!contentSet.has(matchingContent) &&
                                    !meaningSet.has(matchingMeaning) &&
                                    !wordIdSet.has(matchingWord._id)) {
                                }
                                {
                                    contentSet.add(matchingContent);
                                    meaningSet.add(matchingMeaning);
                                    wordIdSet.add(matchingWord._id);
                                }
                            }
                        }
                        if (wordIdSet.size > 0) {
                            paramResults.push({
                                type: input.pattern.type,
                                focusId: `level${input.level}-matching${input.matchingCounter.n}`,
                                matchingLabels: [...wordIdSet],
                                wordsIUnit: input.wordsIUnit,
                            });
                            input.matchingCounter.n++;
                        }
                    }
                }
            }
            return paramResults;
        }
    }
    static generateQuestion(param) {
        function getChoices(hasImageWords, focusId) {
            return hasImageWords
                .filter((element) => {
                return element._id !== focusId;
            })
                .slice(0, 3)
                .map((element) => ({
                _id: element._id,
                active: true,
            }));
        }
        const hasImageWords = param.wordsIUnit.filter((element) => element.imageRoot);
        const questionCode = helper_1.getQuestionTypeCode(enums_1.QUESTION_ENUM.WORD, param.type);
        switch (param.type) {
            case 2:
            case 3:
            case 4:
                if (hasImageWords.findIndex((element) => element._id === param.focusId) !== -1 &&
                    hasImageWords.length >= 2) {
                    return {
                        _id: param.questionId,
                        choices: getChoices(hasImageWords, param.focusId),
                        focus: param.focusId,
                        hiddenIndex: -1,
                        code: questionCode,
                    };
                }
                else {
                    return {
                        _id: param.questionId,
                        choices: [],
                        focus: param.focusId,
                        hiddenIndex: -1,
                        code: Math.random() < 0.5 ? enums_2.QuestionTypeCode.W6 : enums_2.QuestionTypeCode.W13,
                    };
                }
            case 6:
            case 13:
                if (param.wordsIUnit.length >= 2) {
                    return {
                        _id: param.questionId,
                        choices: [],
                        focus: param.focusId,
                        hiddenIndex: -1,
                        code: questionCode,
                    };
                }
                else
                    return null;
            case 8:
            case 11:
            case 12:
            case 14:
                return {
                    _id: param.questionId,
                    choices: [],
                    focus: param.focusId,
                    hiddenIndex: -1,
                    code: questionCode,
                };
            case 9:
                return {
                    _id: param.questionId,
                    choices: param.matchingLabels.map((element) => ({
                        _id: element,
                        active: true,
                    })),
                    focus: param.focusId,
                    hiddenIndex: -1,
                    code: questionCode,
                };
            case 7:
                const focusWord = param.wordsIUnit.find((element) => element._id === param.focusId);
                if (focusWord) {
                    if (focusWord === null || focusWord === void 0 ? void 0 : focusWord.imageRoot) {
                        return {
                            _id: param.questionId,
                            choices: [],
                            hiddenIndex: -1,
                            focus: param.focusId,
                            code: questionCode,
                        };
                    }
                    else {
                        return {
                            _id: param.questionId,
                            choices: [],
                            hiddenIndex: -1,
                            focus: param.focusId,
                            code: enums_2.QuestionTypeCode.W11,
                        };
                    }
                }
                else {
                    return null;
                }
        }
    }
}
exports.WordsService = WordsService;
//# sourceMappingURL=words.service.js.map