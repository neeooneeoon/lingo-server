"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternReader = void 0;
const enums_1 = require("tools/src/generated/enums");
const constants_1 = require("tools/src/generated/constants");
class PatternReader {
    constructor(_pattern) {
        this.pattern = _pattern;
    }
    set(_pattern) {
        this.pattern = _pattern;
    }
    extract() {
        var _a, _b, _c;
        try {
            const [meta, parameters] = (_a = this.pattern) === null || _a === void 0 ? void 0 : _a.split('-');
            if (meta && parameters) {
                const matchingLabels = parameters
                    .trim()
                    .replace(constants_1.GenerationConstants.DIGIT_REGEX, '')
                    .split('');
                const questionType = parseInt(meta.match(/(\d+)/).toString());
                const group = meta.trim()[0].toLowerCase() === 'w'
                    ? enums_1.QUESTION_ENUM.WORD
                    : enums_1.QUESTION_ENUM.SENTENCE;
                const wordLabel = parameters[0].toLowerCase();
                const sentenceLabel = ((_b = parameters[1]) === null || _b === void 0 ? void 0 : _b.replace(constants_1.GenerationConstants.ALPHABET_REGEX, ''))
                    ? parameters[0] + ((_c = parameters[1]) === null || _c === void 0 ? void 0 : _c.replace(constants_1.GenerationConstants.ALPHABET_REGEX, ''))
                    : parameters[0] + '0';
                return {
                    type: questionType,
                    group,
                    matchingLabels,
                    wordLabel,
                    sentenceLabel,
                };
            }
        }
        catch (e) {
            throw e;
        }
    }
}
exports.PatternReader = PatternReader;
//# sourceMappingURL=patternReader.js.map