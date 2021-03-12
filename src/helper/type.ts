export type UserContext = {
    userId: string;
    role: string;
}

export class UnitProgressResponse {
    _id: string;
    name: string;
    description: string;
    totalLevels: number;
    totalLessonsOfLevel: number;
    totalLessons: number;
    doneLessons: number;
    userLevel: number;
    userLesson: number;
    grammar: string;
    tips: string;
}
export class BookProgressResponse {
    bookId: string;
    totalUnits: number;
    units: UnitProgressResponse[];
    level: number;
    score: number;
    totalQuestions: number;
    doneQuestions: number;
}