export const digitalRegex = /[0-9]/g;
export const alphaBetaRegex = /[a-z]/;

export enum QuestionEnum {
  WORD = 'word',
  SENTENCE = 'sentence',
}

export interface IQuestionInfo {
  type: number;
  group: QuestionEnum;
  matchingLabels: Array<string>;
  wordLabel?: string | undefined;
  sentenceLabel?: string | undefined;
}

export class CommandReader {
  private command: string;

  /**
   *
   * @param _command pattern, ex: w3-a
   */
  constructor(_command: string) {
    this.command = _command;
  }

  public extract(): IQuestionInfo | undefined {
    try {
      const [meta, parameters] = this.command?.split('-');
      if (meta && parameters) {
        const matchingLabels = parameters
          .trim()
          .replace(digitalRegex, '')
          .split('');
        const questionType = parseInt(meta.match(digitalRegex).toString());
        const group =
          meta.trim()[0].toLowerCase() === 'w'
            ? QuestionEnum.WORD
            : QuestionEnum.SENTENCE;
        const wordLabel = parameters[0];
        const sentenceLabel = parameters[1]?.replace(alphaBetaRegex, '')
          ? parameters[0] + parameters[1]?.replace(alphaBetaRegex, '')
          : parameters[0] + '0';

        return {
          type: questionType,
          group,
          matchingLabels,
          wordLabel,
          sentenceLabel,
        };
      }
      return undefined;
    } catch (error) {
      throw error;
    }
  }
}
