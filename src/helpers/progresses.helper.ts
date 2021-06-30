import { ProgressBook, ProgressUnit } from "@dto/progress";
import { UnitDocument } from "@entities/unit.entity";
import { ProgressUnitMapping, ProgressBookMapping } from "@dto/progress";
import { BookDocument } from "@entities/book.entity";

export class ProgressesHelper {
    public combineUnitAndProgressUnit(unit: UnitDocument, unitProgress?: ProgressUnit): ProgressUnitMapping {
        if (unit && unit.levels && unit.levels.length > 0) {
            if (unitProgress) {
                let currentLesson = 0;
                const currentLevel = unitProgress.passedLevels;
                const userLevel = unitProgress.levels[currentLevel];
                if (userLevel) {
                    currentLesson = userLevel.lessons.length;
                }
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
                }
            }
            else {
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
    }

    public combineBookAndProgressBook(
        book: BookDocument, bookProgress: ProgressBook, units: ProgressUnitMapping[]
    ): ProgressBookMapping {
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
}