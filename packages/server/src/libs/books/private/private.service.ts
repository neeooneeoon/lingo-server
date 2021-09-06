import { QuestionReducingOutput } from '@dto/questionHolder';
import { BookDocument } from '@entities/book.entity';
import { QuestionHolderDocument } from '@entities/questionHolder.entity';
import { QuestionHoldersService } from '@libs/questionHolders/providers/questionHolders.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { BooksService } from '../providers/books.service';

@Injectable()
export class BookPrivateService {
  constructor(
    private readonly questionHoldersService: QuestionHoldersService,
    private readonly booksService: BooksService,
  ) {}

  public async getQuestionsInLevel(
    bookId: string,
    unitId: string,
    levelIndex: number,
  ): Promise<QuestionReducingOutput> {
    const findBookPromise = this.booksService.getBook(bookId);
    const findQuestionHolderPromise =
      this.questionHoldersService.getQuestionHolder({
        bookId: bookId,
        unitId: unitId,
        level: levelIndex,
      });

    let book: BookDocument;
    let questionHolder: QuestionHolderDocument;

    await Promise.all([findBookPromise, findQuestionHolderPromise])
      .then(([bookResult, questionHolderResult]) => {
        book = bookResult;
        questionHolder = questionHolderResult;
      })
      .catch((error) => {
        throw new BadRequestException(error);
      });
    const multipleChoiceQuestions =
      this.questionHoldersService.multipleChoiceQuestions(
        questionHolder.questions,
      );
    const listAskingQuestionIds = multipleChoiceQuestions.map(
      (item) => item._id,
    );
    const units = book.units;
    if (!units || units.length === 0) {
      throw new BadRequestException(`No unit in this book ${bookId}`);
    }
    const currentUnit = units.find((unit) => unit._id === unitId);
    if (!currentUnit) {
      throw new BadRequestException(
        `Can't find unit ${unitId} in book ${bookId}`,
      );
    }
    return this.questionHoldersService.adminReduceQuestion({
      questions: multipleChoiceQuestions,
      listAskingQuestionIds: listAskingQuestionIds,
      currentUnit: currentUnit,
      grade: book.grade,
    });
  }
}
