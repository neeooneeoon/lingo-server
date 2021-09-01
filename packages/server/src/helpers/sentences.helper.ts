import { SentenceInLesson } from '@dto/sentence';
import { SentenceDocument } from '@entities/sentence.entity';

export class SentencesHelper {
  public mapSentenceToSentenceInLesson(
    sentence: SentenceDocument,
  ): SentenceInLesson {
    return {
      _id: sentence._id,
      audio: sentence.audio,
      enText: sentence.content,
      vnText: sentence.translate,
      vn: sentence.translateSplit.map((val) => ({
        _id: val._id,
        text: val.text,
        wordId: '',
      })),
      en: sentence.contentSplit.map((val) => ({
        _id: val._id,
        text: val.text,
        wordId: val.wordId,
      })),
      lowerBound: sentence.lowerBound,
      upperBound: sentence.upperBound,
      questionSection: sentence.questionSection,
      contextSection: sentence.contextSection,
      isConversation: sentence.isConversation,
    };
  }
}
