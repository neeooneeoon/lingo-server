"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankingService = void 0;
const enums_1 = require("tools/src/generated/enums");
const constants_1 = require("tools/src/generated/constants");
class RankingService {
    static generate(patternKey, questionType, group) {
        const MAX_RANKING = 4;
        const keyType = String(questionType);
        const keyGroup = group === enums_1.QUESTION_ENUM.WORD
            ? enums_1.QUESTION_RANK_ENUM.WORD
            : enums_1.QUESTION_RANK_ENUM.SENTENCE;
        switch (patternKey) {
            case enums_1.PATTERN_KEYS_ENUM.SEGMENT_1_2:
                return constants_1.GenerationConstants.QUESTION_RANKS[enums_1.PATTERN_KEYS_ENUM.SEGMENT_1_2][keyGroup][keyType];
            case enums_1.PATTERN_KEYS_ENUM.SEGMENT_3_5:
                return constants_1.GenerationConstants.QUESTION_RANKS[enums_1.PATTERN_KEYS_ENUM.SEGMENT_3_5][keyGroup][keyType];
            case enums_1.PATTERN_KEYS_ENUM.SEGMENT_6_12:
                return constants_1.GenerationConstants.QUESTION_RANKS[enums_1.PATTERN_KEYS_ENUM.SEGMENT_6_12][keyGroup][keyType];
            default:
                return MAX_RANKING;
        }
    }
}
exports.RankingService = RankingService;
//# sourceMappingURL=ranking.service.js.map