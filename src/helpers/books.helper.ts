import { BookGrade } from "@dto/book";
import { ProgressBook } from "@dto/progress";
import { BookDocument } from "@entities/book.entity";

export class BooksHelper {
    public mapToBookGrade(book: BookDocument, progressBook?: ProgressBook | undefined): BookGrade {
        return {
            _id: book._id,
            bookNId: book.nId,
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
    public getID(alias: string): string {
        let str = alias;
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(
          /!|@|%|\^|\*|\(|\)|\+|\=|\<| |\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
          ""
        );
        str = str.replace(/ + /g, "");
        str = str.trim();
        return str;
    }
}