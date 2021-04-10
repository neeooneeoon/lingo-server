import { UnitDocument } from 'src/libs/units/schema/unit.schema';
import { ProgressBookUnit, ProgressBook } from 'src/libs/progresses/schema/progress.schema';
import { UnitProgressResponse, BookProgressResponse } from './type';
import { BookDocument } from 'src/libs/books/schema/book.schema';
import { WordDocument } from 'src/libs/words/schema/word.schema';
import { WordDataOfLesson } from 'src/libs/words/dto/word.dto';
import { SentenceDocument } from 'src/libs/sentences/schema/sentence.schema';
import { SentenceDataOfLesson } from 'src/libs/sentences/dto/sentence.dto';

export class ResultMappingHelper {
    public mapUnitWithUserUnitProgress(unit: UnitDocument, unitProgress?: ProgressBookUnit): UnitProgressResponse {
        if (unitProgress) {
            let currentLesson = 0;
            const currentLevel = unitProgress.passedLevels;
            const userLevel = unitProgress.levels[currentLevel];
            if (userLevel)
                currentLesson = userLevel.lessons.length;
            return {
                _id: unit._id,
                name: unit.name,
                description: unit.description,
                totalLevels: unit.levels.length - 1,
                totalLessons: unit.totalLessons,
                doneLessons: unitProgress ? unitProgress.doneLessons : 0,
                totalLessonsOfLevel:
                    currentLevel === unitProgress.totalLevels - 1 ? 1 : unit.levels[currentLevel].totalLessons,
                userLevel: currentLevel,
                userLesson: currentLesson,
                grammar: unit.grammar,
                tips: unit.tips
            };
        } else {
            return {
                _id: unit._id,
                name: unit.name,
                description: unit.description,
                totalLevels: unit.levels.length - 1,
                totalLessonsOfLevel: unit.levels[0].totalLessons,
                totalLessons: unit.totalLessons,
                doneLessons: 0,
                userLevel: 0,
                userLesson: 0,
                grammar: unit.grammar,
                tips: unit.tips
            };
        }
    }
    public mapBookToBookProgress(book: BookDocument, bookProgress: ProgressBook, units: UnitProgressResponse[]): BookProgressResponse {
        return {
            units: units,
            bookId: book._id,
            level: bookProgress.level,
            score: bookProgress.score,
            totalUnits: book.units.length,
            totalQuestions: book.totalQuestions,
            doneQuestions: bookProgress.doneQuestions,
        }
    }
    public mapWordToLessonData(word: WordDocument): Partial<WordDataOfLesson> {
        return {
            _id: word._id,
            content: word.content,
            meaning: word.meaning,
            types: word.types,
            pronunciations: word.pronunciations,
            imageRoot: word.imageRoot
        }
    }
    public mapSentenceToLessonData(sentence: SentenceDocument): SentenceDataOfLesson {
        return {
            _id: sentence._id,
            audio: sentence.audio,
            enText: sentence.content,
            vnText: sentence.translate,
            vn: sentence.translateSplit.map(val => ({ _id: val._id, text: val.text, wordId: "" })),
            en: sentence.contentSplit.map(val => ({ _id: val._id, text: val.text, wordId: val.wordId }))
        }
    }
}

