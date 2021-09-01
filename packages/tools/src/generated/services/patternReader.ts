import { QuestionInfo } from "@lingo/tools/src/generated/types";
import { QUESTION_ENUM } from "@lingo/tools/src/generated/enums";
import { GenerationConstants as GC } from "@lingo/tools/src/generated/constants";

export class PatternReader {
  private pattern: string;

  constructor(_pattern: string) {
    this.pattern = _pattern;
  }

  public set(_pattern: string) {
    this.pattern = _pattern;
  }

  public extract(): QuestionInfo | undefined {
    try {
      const [meta, parameters] = this.pattern?.split("-");
      if (meta && parameters) {
        const matchingLabels = parameters
          .trim()
          .replace(GC.DIGIT_REGEX, "")
          .split("");
        const questionType = parseInt(meta.match(/(\d+)/)!.toString());
        const group =
          meta.trim()[0].toLowerCase() === "w"
            ? QUESTION_ENUM.WORD
            : QUESTION_ENUM.SENTENCE;
        const wordLabel = parameters[0].toLowerCase();
        const sentenceLabel = parameters[1]?.replace(GC.ALPHABET_REGEX, "")
          ? parameters[0] + parameters[1]?.replace(GC.ALPHABET_REGEX, "")
          : parameters[0] + "0";

        return {
          type: questionType,
          group,
          matchingLabels,
          wordLabel,
          sentenceLabel,
        };
      }
    } catch (e) {
      throw e;
    }
  }
}
