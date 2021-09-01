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
exports.PunctuationService = void 0;
const stringSimilarity = require("string-similarity");
const stories = require("tools/src/generated/data/sentencesFromStories.json");
class PunctuationService {
    constructor(__punctuations, _focusSentence, _sentencesCollection) {
        this.punctuationSet = new Set(__punctuations);
        this.focusSentence = _focusSentence;
        this.sentencesCollection = _sentencesCollection;
    }
    containPunctuations(otherContent) {
        const allPunctuations = ['“', '”', '"', '’', "'", '!', ',', '?', '.'];
        let matchAll = true;
        for (const p of allPunctuations) {
            const punctuationIndex = otherContent.indexOf(p);
            if (punctuationIndex === -1) {
                if (this.punctuationSet.has(p)) {
                    matchAll = false;
                    break;
                }
            }
            else {
                if (!this.punctuationSet.has(p)) {
                    matchAll = false;
                    break;
                }
            }
        }
        return matchAll;
    }
    static compareBaseSimilarityRate(a, b) {
        if (a.rating > b.rating) {
            return -1;
        }
        else if (a.rating < b.rating) {
            return -1;
        }
        else {
            return 0;
        }
    }
    findBestMatchSentences(content, listContents, matchedSentences) {
        const choices = [];
        const { ratings } = stringSimilarity.findBestMatch(content, listContents);
        const ratingsLength = ratings.length;
        const listSimilarity = [];
        for (let i = 0; i < ratingsLength; i++) {
            const extractSentence = matchedSentences[i];
            listSimilarity.push(Object.assign(Object.assign({}, ratings[i]), { _id: extractSentence._id, unitNId: extractSentence.unitNId, bookNId: extractSentence.unitNId }));
        }
        const similaritySentencesPrev = listSimilarity.filter((item) => (item.bookNId == this.focusSentence.bookNId &&
            item.unitNId <= this.focusSentence.unitNId) ||
            item.bookNId < this.focusSentence.bookNId);
        if (similaritySentencesPrev.length > 0) {
            similaritySentencesPrev
                .sort(PunctuationService.compareBaseSimilarityRate)
                .slice(0, 5)
                .map((item) => {
                if (item === null || item === void 0 ? void 0 : item._id) {
                    choices.push(item._id);
                }
            });
        }
        if (choices.length == 0) {
            const similaritySentencesPost = listSimilarity.filter((item) => (item.bookNId == this.focusSentence.bookNId &&
                item.unitNId > this.focusSentence.unitNId) ||
                item.bookNId > this.focusSentence.bookNId);
            if (similaritySentencesPost.length > 0) {
                similaritySentencesPost.slice(0, 5).map((item) => {
                    if (item === null || item === void 0 ? void 0 : item._id) {
                        choices.push(item._id);
                    }
                });
            }
        }
        return choices;
    }
    findBestMatchStories(content, listContents, listStories) {
        return __awaiter(this, void 0, void 0, function* () {
            const choices = [];
            const { ratings } = stringSimilarity.findBestMatch(content, listContents);
            if ((ratings === null || ratings === void 0 ? void 0 : ratings.length) > 0) {
                const storySimilarity = ratings
                    .map((el, i) => {
                    return Object.assign(Object.assign({}, el), { _id: listStories[i]._id, content: listStories[i].content });
                })
                    .sort(PunctuationService.compareBaseSimilarityRate)
                    .slice(0, 5);
                const storedSentences = (yield this.sentencesCollection
                    .find({
                    bookNId: -2,
                    unitNId: -2,
                })
                    .toArray()).map((el) => el._id);
                console.log(storedSentences);
                const rawDocs = [];
                storySimilarity.forEach((el) => {
                    choices.push(el._id);
                    if (!storedSentences.includes(el._id)) {
                        rawDocs.push({
                            isConversation: false,
                            _id: el._id,
                            bookNId: -2,
                            unitNId: -2,
                            position: 0,
                            baseId: el._id,
                            content: el.content,
                            tempTranslates: [],
                            wordBaseIndex: -1,
                            translate: '',
                            audio: '',
                            contentSplit: [],
                            translateSplit: [],
                            translates: [],
                            replaceWords: [],
                            lowerBound: 0,
                            upperBound: 0,
                        });
                    }
                });
                if (rawDocs.length > 0) {
                    this.sentencesCollection.insertMany(rawDocs, (err, res) => {
                        if (err) {
                            console.log(err.message);
                            throw err;
                        }
                    });
                }
            }
            return choices;
        });
    }
    similaritySentences(listSentences) {
        const content = this.focusSentence.content.trim();
        let choices = [];
        const matchedPunctuations = [];
        const matchedPunctuationContents = [];
        for (const sentence of listSentences) {
            const formattedSentenceContent = sentence.content.trim();
            if (sentence._id != this.focusSentence._id &&
                formattedSentenceContent != content &&
                Math.abs(formattedSentenceContent.length - content.length) <= 2) {
                if (this.containPunctuations(formattedSentenceContent)) {
                    matchedPunctuations.push(sentence);
                    matchedPunctuationContents.push(formattedSentenceContent);
                }
            }
        }
        if (matchedPunctuations.length > 0) {
            choices = this.findBestMatchSentences(content, matchedPunctuationContents, matchedPunctuations);
        }
        return choices;
    }
    similarityStories() {
        return __awaiter(this, void 0, void 0, function* () {
            const content = this.focusSentence.content.trim();
            const listContents = [];
            const listStories = [];
            for (const story of stories) {
                if (story === null || story === void 0 ? void 0 : story.content) {
                    const trimmedContent = story.content.trim();
                    if (trimmedContent !== content &&
                        Math.abs(trimmedContent.length - content.length) <= 2) {
                        if (this.containPunctuations(trimmedContent)) {
                            listContents.push(trimmedContent);
                            listStories.push(story);
                        }
                    }
                }
            }
            if (listStories.length > 0) {
                return yield this.findBestMatchStories(content, listContents, listStories);
            }
            return [];
        });
    }
}
exports.PunctuationService = PunctuationService;
//# sourceMappingURL=punctuation.service.js.map