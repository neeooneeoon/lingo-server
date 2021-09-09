import { SentenceInLesson } from '@dto/sentence';
import { WordInLesson } from '@dto/word';
import { LessonDocument } from '@entities/lesson.entity';

export class GetLessonInput {
  bookId: string;
  unitId: string;
  levelIndex: number;
  lessonIndex?: number;
  isOverLevel: boolean;
}

export class GetLessonOutput {
  lesson: Partial<LessonDocument>;
  words: WordInLesson[];
  sentences: SentenceInLesson[];
}
