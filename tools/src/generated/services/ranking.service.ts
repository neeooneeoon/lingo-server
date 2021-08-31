import {
  PATTERN_KEYS_ENUM,
  QUESTION_ENUM,
  QUESTION_RANK_ENUM,
} from 'tools/src/generated/enums';
import { GenerationConstants as GC } from 'tools/src/generated/constants';

export class RankingService {
  public static generate(
    patternKey: PATTERN_KEYS_ENUM,
    questionType: number,
    group: QUESTION_ENUM,
  ): number {
    const MAX_RANKING = 4;
    const keyType = String(questionType);
    const keyGroup =
      group === QUESTION_ENUM.WORD
        ? QUESTION_RANK_ENUM.WORD
        : QUESTION_RANK_ENUM.SENTENCE;
    switch (patternKey) {
      case PATTERN_KEYS_ENUM.SEGMENT_1_2:
        return GC.QUESTION_RANKS[PATTERN_KEYS_ENUM.SEGMENT_1_2][keyGroup][
          keyType
        ];
      case PATTERN_KEYS_ENUM.SEGMENT_3_5:
        return GC.QUESTION_RANKS[PATTERN_KEYS_ENUM.SEGMENT_3_5][keyGroup][
          keyType
        ];
      case PATTERN_KEYS_ENUM.SEGMENT_6_12:
        return GC.QUESTION_RANKS[PATTERN_KEYS_ENUM.SEGMENT_6_12][keyGroup][
          keyType
        ];
      default:
        return MAX_RANKING;
    }
  }
}
