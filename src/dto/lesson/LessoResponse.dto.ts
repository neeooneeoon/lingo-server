import { LessonDocument } from "@entities/lesson.entity";
import { SentenceDocument } from "@entities/sentence.entity";
import { WordDocument } from "@entities/word.entity";


export class LessonResponse {
    lesson: LessonDocument;
    words: Partial<WordDocument>;
    sentences: Partial<SentenceDocument>;
}