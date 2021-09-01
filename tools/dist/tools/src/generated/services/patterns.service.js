"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternsService = void 0;
const constants_1 = require("tools/src/generated/constants");
const enums_1 = require("tools/src/generated/enums");
class PatternsService {
    constructor(_grade) {
        if (Number.isInteger(_grade) && _grade >= 1 && _grade <= 12) {
            this.grade = _grade;
            switch (true) {
                case this.grade <= 2:
                    this.unitPattern = constants_1.GenerationConstants.GRADE_PATTERNS[enums_1.PATTERN_KEYS_ENUM.SEGMENT_1_2]
                        .join('')
                        .trim();
                    this.originalPattern =
                        constants_1.GenerationConstants.GRADE_PATTERNS[enums_1.PATTERN_KEYS_ENUM.SEGMENT_1_2];
                    break;
                case this.grade <= 5:
                    this.unitPattern = constants_1.GenerationConstants.GRADE_PATTERNS[enums_1.PATTERN_KEYS_ENUM.SEGMENT_3_5]
                        .join('')
                        .trim();
                    this.originalPattern =
                        constants_1.GenerationConstants.GRADE_PATTERNS[enums_1.PATTERN_KEYS_ENUM.SEGMENT_3_5];
                    break;
                case this.grade <= 12:
                    this.unitPattern = constants_1.GenerationConstants.GRADE_PATTERNS[enums_1.PATTERN_KEYS_ENUM.SEGMENT_6_12]
                        .join('')
                        .trim();
                    this.originalPattern =
                        constants_1.GenerationConstants.GRADE_PATTERNS[enums_1.PATTERN_KEYS_ENUM.SEGMENT_6_12];
                    break;
                default:
                    break;
            }
        }
        else {
            throw new Error('Grade is invalid.');
        }
    }
    getLabels(totalWords) {
        if (this.unitPattern && totalWords > 0 && Number.isInteger(totalWords)) {
            const labelString = this.unitPattern
                .replace(constants_1.GenerationConstants.DIGIT_REGEX, '')
                .replace(/[-sw, \n]/g, '');
            const labelSet = [...new Set(labelString.split(''))];
            let cursor = 0;
            const labelResult = [];
            for (let i = 0; i < totalWords; i++) {
                if (cursor >= labelSet.length)
                    cursor = 0;
                labelResult.push(labelSet[cursor]);
                cursor++;
            }
            return labelResult;
        }
        else {
            throw new Error('Unit pattern is null or no have words in unit.');
        }
    }
    getLevelsLabels() {
        if (this.originalPattern) {
            return this.originalPattern.map((element) => {
                return element
                    .split(',')
                    .map((pattern) => {
                    return pattern.trim().replace(/\n/g, '');
                })
                    .filter((pattern) => pattern);
            });
        }
        else {
            throw new Error('originalPattern property is used before assigned.');
        }
    }
    static isInLabels(questionInfo, listLabels) {
        if (questionInfo.group === enums_1.QUESTION_ENUM.WORD) {
            if (questionInfo.type === 9) {
                return (questionInfo.matchingLabels.filter((element) => listLabels.includes(element)).length >= 2);
            }
            else {
                return (questionInfo.wordLabel && listLabels.includes(questionInfo.wordLabel));
            }
        }
        else {
            return listLabels.includes(questionInfo.wordLabel);
        }
    }
}
exports.PatternsService = PatternsService;
//# sourceMappingURL=patterns.service.js.map