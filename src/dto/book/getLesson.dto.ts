import { SentenceInLesson } from "@dto/sentence";
import { WordInLesson } from "@dto/word/wordInLesson.dto";
import { LessonDocument } from "@entities/lesson.entity";

export class GetLessonInput {
    bookId: string;
    unitId: string;
    levelIndex: number;
    lessonIndex: number;
}

export class GetLessonOutput {
    lesson: Partial<LessonDocument>;
    words: WordInLesson[];
    sentences: SentenceInLesson[];
}
