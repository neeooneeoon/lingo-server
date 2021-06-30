import { BookGrade } from "@dto/book";
import { ProgressBook } from "@dto/progress";
import { BookDocument } from "@entities/book.entity";

export class BooksHelper {
    public mapToBookGrade(book: BookDocument, progressBook?: ProgressBook | undefined): BookGrade {
        return {
            _id: book._id,
            name: book.name,
            grade: book.grade,
            cover: book.cover,
            totalWords: book.totalWords,
            totalUnits: book.units.length,
            description: book.description,
            totalQuestions: book.totalQuestions,
            totalLessons: book.totalLessons,
            doneLessons: progressBook ?
                (progressBook.doneLessons > book.totalLessons ?
                    book.totalLessons : progressBook.doneLessons) :
                0,
            doneQuestions: progressBook ?
                (progressBook.doneQuestions > book.totalQuestions ?
                    book.totalQuestions : progressBook.doneQuestions) :
                0
        }
    }
}