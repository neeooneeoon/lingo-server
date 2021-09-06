import { ProgressBook, ProgressUnit } from '@dto/progress';
import { UnitDocument } from '@entities/unit.entity';
import { ProgressUnitMapping, ProgressBookMapping } from '@dto/progress';
import { BookDocument } from '@entities/book.entity';

export class ProgressesHelper {
  public combineUnitAndProgressUnit(
    unit: UnitDocument,
    unitProgress?: ProgressUnit,
  ): ProgressUnitMapping {
    if (unit && unit.levels && unit.levels.length > 0) {
      if (unitProgress) {
        let currentLesson = 0;
        let currentLevel = unitProgress.passedLevels;
        const userLevel = unitProgress.levels[currentLevel];
        if (userLevel) {
          currentLesson = userLevel.lessons.length;
          if (currentLesson > unit.levels[currentLevel].totalLessons) {
            currentLesson = unit.levels[currentLevel].totalLessons;
            currentLevel++;
          }
        }
        let doneLessons = unitProgress?.doneLessons;
        if (doneLessons > unit.totalLessons) {
          doneLessons = unit.totalLessons;
        }
        if (currentLevel === 5 && doneLessons != unit.totalLessons) {
          doneLessons = unit.totalLessons;
        }
        const totalLessons = unit.levels[currentLevel]?.lessons?.length;
        return {
          _id: unit._id,
          unitNId: unit.nId,
          name: unit.name,
          description: unit.description,
          totalLevels: unit.levels.length,
          totalLessons: unit.totalLessons,
          doneLessons: doneLessons ? doneLessons : 0,
          totalLessonsOfLevel: totalLessons ? totalLessons : 0,
          userLevel: currentLevel,
          userLesson: currentLesson,
          grammar: unit.grammar,
          tips: unit.tips,
          blueImage: unit.blueImage,
          normalImage: unit.normalImage,
          stories: unit?.stories,
        };
      } else {
        return {
          _id: unit._id,
          unitNId: unit.nId,
          name: unit.name,
          description: unit.description,
          totalLevels: unit.levels.length,
          totalLessonsOfLevel: unit.levels[0].totalLessons,
          totalLessons: unit.totalLessons,
          doneLessons: 0,
          userLevel: 0,
          userLesson: 0,
          grammar: unit.grammar,
          tips: unit.tips,
          blueImage: unit.blueImage,
          normalImage: unit.normalImage,
          stories: unit?.stories,
        };
      }
    }
  }

  public combineBookAndProgressBook(
    book: BookDocument,
    bookProgress: ProgressBook,
    units: ProgressUnitMapping[],
  ): ProgressBookMapping {
    return {
      units: units,
      bookNId: book.nId,
      bookId: book._id,
      level: bookProgress.level,
      score: bookProgress.score,
      totalUnits: book.units.length,
      totalQuestions: book.totalQuestions,
      doneQuestions: bookProgress.doneQuestions,
    };
  }
}
