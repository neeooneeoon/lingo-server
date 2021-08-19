import { SentenceInLesson } from '@dto/sentence';
import { WordInLesson } from '@dto/word';
import { QuestionDocument } from '@entities/question.entity';
import { UnitDocument } from '@entities/unit.entity';

export class QuestionReducingInput {
  questions: QuestionDocument[];
  listAskingQuestionIds: string[];
  currentUnit: UnitDocument;
}

export class QuestionReducingOutput {
  wordsInLesson: WordInLesson[];
  sentencesInLesson: SentenceInLesson[];
  listQuestions: any[];
}
