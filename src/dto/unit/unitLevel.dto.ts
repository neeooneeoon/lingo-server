import { LessonDocument } from '@entities/lesson.entity';
export class UnitLevel {
  levelIndex: number;
  totalLessons: number;
  totalQuestions: number;
  lessons: LessonDocument[];
}
