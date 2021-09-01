import { BookDocument } from '@entities/book.entity';

export class LessonTree {
  isLastLesson: boolean;
  grade: number;
  bookId: string;
  unitId: string;
  levelIndex: number;
  lessonIndex: number;
  unitTotalLevels: number;
  levelTotalLessons: number;
  lessonTotalQuestions: number;
  book: BookDocument;
}
