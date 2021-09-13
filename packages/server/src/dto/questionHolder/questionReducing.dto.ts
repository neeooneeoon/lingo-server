import { SentenceInLesson } from '@dto/sentence';
import { WordInLesson } from '@dto/word';
import { QuestionDocument } from '@entities/question.entity';
import { UnitDocument } from '@entities/unit.entity';
import { LeanDocument } from 'mongoose';

export class QuestionReducingInput {
  questions: LeanDocument<QuestionDocument>[];
  listAskingQuestionIds: string[];
  currentUnit: UnitDocument;
  grade: number;
}

export class QuestionReducingOutput {
  wordsInLesson: WordInLesson[];
  sentencesInLesson: SentenceInLesson[];
  listQuestions: any[];
}
