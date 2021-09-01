"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestionTypeCode = void 0;
const enums_1 = require("../enums");
const enums_2 = require("src/utils/enums");
function getQuestionTypeCode(questionEnum, type) {
    if (questionEnum === enums_1.QUESTION_ENUM.WORD) {
        switch (type) {
            case 3:
                return enums_2.QuestionTypeCode.W3;
            case 6:
                return enums_2.QuestionTypeCode.W6;
            case 11:
                return enums_2.QuestionTypeCode.W11;
            case 7:
                return enums_2.QuestionTypeCode.W7;
            case 2:
                return enums_2.QuestionTypeCode.W2;
            case 4:
                return enums_2.QuestionTypeCode.W4;
            case 12:
                return enums_2.QuestionTypeCode.W12;
            case 9:
                return enums_2.QuestionTypeCode.W9;
            case 8:
                return enums_2.QuestionTypeCode.W8;
            case 13:
                return enums_2.QuestionTypeCode.W13;
            case 14:
                return enums_2.QuestionTypeCode.W14;
            default:
                break;
        }
    }
    else if (questionEnum === enums_1.QUESTION_ENUM.SENTENCE) {
        switch (type) {
            case 12:
                return enums_2.QuestionTypeCode.S12;
            case 10:
                return enums_2.QuestionTypeCode.S10;
            case 1:
                return enums_2.QuestionTypeCode.S1;
            case 2:
                return enums_2.QuestionTypeCode.S2;
            case 14:
                return enums_2.QuestionTypeCode.S14;
            case 17:
                return enums_2.QuestionTypeCode.S17;
            case 7:
                return enums_2.QuestionTypeCode.S7;
            case 15:
                return enums_2.QuestionTypeCode.S15;
            case 16:
                return enums_2.QuestionTypeCode.S16;
            case 4:
                return enums_2.QuestionTypeCode.S4;
            case 18:
                return enums_2.QuestionTypeCode.S18;
            default:
                break;
        }
    }
}
exports.getQuestionTypeCode = getQuestionTypeCode;
//# sourceMappingURL=index.js.map