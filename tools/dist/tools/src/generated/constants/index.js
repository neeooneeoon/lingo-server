"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerationConstants = void 0;
class GenerationConstants {
}
exports.GenerationConstants = GenerationConstants;
GenerationConstants.DIGIT_REGEX = /[0-9]/g;
GenerationConstants.ALPHABET_REGEX = /[a-z]/;
GenerationConstants.GRADE_PATTERNS = {
    '1_2': [
        'w2-a, w2-b, w2-c, w3-c, w3-a, w3-b, w4-a, w6-b, w13-b, w4-c, w6-a, w13-c,',
        'w12-a, w12-c, w12-b, w9-abc, w3-b, w2-a, w4-c, w4-b, s12-a, s2-a, s10-b, s7-b,',
        'w2-b, s12-c, s2-c, s7-a, s7-c, w12-a, w12-b, w12-c, w6-c, w4-a, w3-c, s7-b2,',
        's7-a2, w12-b, w9-bca, s7-c2, w6-a, s4-a, s1-b, s4-b, s17-a, s10-c, s1-c, s4-c,',
        's17-b, s1-c2, w12-a, s1-b2, w6-b, s4-c2, s4-a2, w12-c, w13-a, s10-a2, s1-b2, s17-a2,',
    ],
    '3_5': [
        `w2-a, w2-b, w2-c, w4-d, w6-a, w13-c, w2-e, w3-b, w6-d, w2-f,
      w6-e, w9-abcde, w6-f, w12-a, w12-b, s10-a, s12-b, w2-g, w4-h, w3-i,`,
        `w12-c, w12-d, s7-c, s1-d, w13-g, w6-h, w13-i, w12-e, s10-e, w3-k,
      w9-fghik, w13-k, s17-a, s4-a, s7-b, w12-f, w12-g, s12-f2, s10-g, s2-c,`,
        `s10-h, s1-i, w12-h, w12-i, s1-f2, s15-c2, s2-d, s4-d, s12-e, s10-f,
      s2-g, s15-e, s4-f, s17-h, w12-k, w9-abefg, s12-g2, s7-h2, w14-b, w14-c,`,
        `s1-b2, s4-b2, s12-i, s1-k, w12-a, w12-c, s2-h2, s7-i2,
      s1-a2, s15-f, s2-c2, s10-d2, s7-k2, w11-d, w12-d, w12-f, s17-i, s4-k, w14-g, s7-e2,`,
        `w11-i, w12-e, w12-g, w12-h, s2-k, s4-c, s2-b, s17-d2, s15-g2, w9-cdhik,
      w11-a, s2-e2, s17-g, s15-a2, w14-e, w14-f, s4-h, w11-h, w11-k, w12-b,`,
    ],
    '6_12': [
        `w2-a, w2-b, w13-c, w4-d, w6-e, w2-f, w4-g, w4-h, w3-i, w6-a, w2-c, w3-k, w4-m,
        w3-l, w6-d, w2-e, w3-f, w9-abcde, w12-a, w12-b, s10-a, s12-b, w12-i, w13-h,`,
        `w6-g, s7-c, s1-d, w6-l, w2-m, w13-b, w12-d, w12-k, w13-i, w12-e, s10-e, w9-fghik, s17-a,
        s7-b, w12-f, w12-g, s12-f2, w13-k, s10-h, w12-c, w7-c, w12-l, s7-h2, s19-h2, w14-e,`,
        `w13-d, s2-c, w12-m, w7-d, s1-i, s19-i, w12-h, s15-c2, s2-d2, s19-c, s12-l, s10-f, s2-g, s15-e2,
        s19-f, s17-h, w12-k, w12-e, w9-ciklm, s12-g2, s10-m, w12-a, w12-b, w14-b, w14-a, s1-k, s19-d, s19-k,`,
        `s12-d, s1-b2, s19-b2, s1-f, w12-c, s15-k2,  w14-l, s15-g, s2-e, s19-g, s7-k2, s19-e, s4-X, w7-f, s14-X,
        w12-d, w14-g, s17-f2, w11-m, w12-g, w12-f, w12-h, s18-X, s17-b, s7-a2, s19-a2, s12-i, s15-m2, s18-X2,`,
        `s7-e2, w14-h, w11-i, s1-l, s4-X2, s17-c2, s2-a2, w7-a, s12-m, w11-b, s14-X2, s18-X3, s4-X3, w14-f, w7-h,
        w12-i, w12-l, w12-m, s17-l2, s14-X3, s10-g2, s19-l2, s2-m2, s4-X4, s15-h2, s7-i2, s18-X4, s17-i2, w14-k, s4-X5,`,
    ],
};
GenerationConstants.QUESTION_RANKS = {
    '3_5': {
        Word: {
            '2': 1,
            '3': 1,
            '4': 1,
            '6': 1,
            '7': 3,
            '8': 4,
            '9': 2,
            '11': 3,
            '12': 3,
            '13': 1,
            '14': 4,
        },
        Sentence: {
            '1': 3,
            '2': 2,
            '4': 3,
            '7': 3,
            '10': 2,
            '12': 2,
            '14': 4,
            '15': 4,
            '16': 4,
            '17': 3,
            '18': 4,
        },
    },
    '1_2': {
        Word: {
            '2': 1,
            '3': 1,
            '4': 1,
            '6': 1,
            '7': 3,
            '8': 4,
            '9': 2,
            '11': 3,
            '12': 3,
            '13': 1,
            '14': 4,
        },
        Sentence: {
            '1': 3,
            '2': 2,
            '4': 3,
            '7': 3,
            '10': 2,
            '12': 2,
            '14': 4,
            '15': 4,
            '16': 4,
            '17': 3,
            '18': 4,
        },
    },
    '6_12': {
        Word: {
            '2': 1,
            '3': 1,
            '4': 1,
            '6': 1,
            '7': 3,
            '8': 4,
            '9': 2,
            '11': 3,
            '12': 3,
            '13': 1,
            '14': 4,
        },
        Sentence: {
            '1': 3,
            '2': 2,
            '4': 3,
            '7': 3,
            '10': 2,
            '12': 2,
            '14': 4,
            '15': 4,
            '16': 4,
            '17': 3,
            '18': 4,
        },
    },
};
//# sourceMappingURL=index.js.map