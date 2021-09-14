class WorkResult {
  results: any;
  timeStart: Date;
  timeEnd: Date;
}

class LessonWork {
  lessonIndex: number;
  works: WorkResult[];
}

export class LevelWork {
  levelIndex: number;
  lessons: LessonWork[];
  incorrectList: string[];
}

export class UnitWork {
  unitId: string;
  levels: LevelWork[];
  incorrectList: string[];
  didList: string[];
}
