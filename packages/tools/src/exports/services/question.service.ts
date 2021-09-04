import { Book } from '@lingo/core/src/entities/book.entity';
import { QuestionHolder } from '@lingo/core/src/entities/questionHolder.entity';
import { Sentence } from '@lingo/core/src/entities/sentence.entity';
import { Word } from '@lingo/core/src/entities/word.entity';
import { Collection } from 'mongodb';
import {
  MultipleChoiceCode,
  ListWorQuestionCodes,
  ListSentenceQuestionCodes,
} from '@lingo/core/src/utils/constants';
import { QuestionTypeCode } from '@lingo/core/src/utils/enums';

export class QuestionService {
  private questionHoldersCollection: Collection<QuestionHolder>;
  private sentencesCollection: Collection<Sentence>;
  private wordsCollection: Collection<Word>;

  constructor(
    _questionHoldersCollection: Collection<QuestionHolder>,
    _sentencesCollection: Collection<Sentence>,
    _wordsCollection: Collection<Word>,
  ) {
    this.questionHoldersCollection = _questionHoldersCollection;
    this.sentencesCollection = _sentencesCollection;
    this.wordsCollection = _wordsCollection;
  }
  public async getMultipleChoiceQuestions(books: Book[]) {
    const listItems = await Promise.all(
      books.map(async (element) => {
        return {
          bookName: element.name,
          questionHolders: await this.questionHoldersCollection
            .find({
              bookId: element._id,
            })
            .toArray(),
        };
      }),
    );
    const multipleChoicesQuestions = listItems.map((element) => {
      const questionHolders = element.questionHolders;
      const questions = questionHolders
        .map((element) => {
          return element.questions
            .filter(
              (element) => MultipleChoiceCode.includes(element.code) === true,
            )
            .map((question) => ({
              item: question,
              bookId: element.bookId,
              unitId: element.unitId,
              level: element.level,
            }));
        })
        .flat();
      const wordQuestions = questions.filter((question) =>
        ListWorQuestionCodes.includes(question.item.code),
      );
      const sentenceQuestions = questions.filter((question) =>
        ListSentenceQuestionCodes.includes(question.item.code),
      );
      return {
        bookName: element.bookName,
        wordQuestions: wordQuestions,
        sentenceQuestions: sentenceQuestions,
      };
    });
    const data: [
      {
        [key: string]: string[][];
      },
    ] = [{}];
    for (const element of multipleChoicesQuestions) {
      const subData = {
        [element.bookName]: [],
      };
      for (const element1 of element.wordQuestions) {
        let originalWord = '';
        let originalWordId = '';
        if (element1.item.code !== QuestionTypeCode.W9) {
          const word = await this.wordsCollection.findOne({
            _id: element1.item.focus,
          });
          if (word) {
            originalWord = word.content;
            originalWordId = word._id;
          }
        }
        const activeChoices = element1.item.choices
          .filter((choice) => choice.active === true)
          .map((choice) => choice._id);
        const choiceWords = (
          await this.wordsCollection
            .find({
              _id: { $in: activeChoices },
            })
            .toArray()
        ).map((choice) => choice.content);
        const interaction = this.getContent(element1.item.code);
        subData[element.bookName].push([
          element1.bookId,
          element1.unitId,
          `${element1.level}`,
          element1.item._id,
          interaction,
          originalWord,
          '',
          choiceWords.join(', ').toString(),
          originalWordId,
          element1.item.code,
        ]);
      }
      for (const element1 of element.sentenceQuestions) {
        const sentence = await this.sentencesCollection.findOne({
          _id: element1.item.focus,
        });
        if (sentence) {
          const interaction = this.getContent(element1.item.code);
          let choices: Array<string> = [];
          const activeChoices = element1.item.choices.filter(
            (choice) => choice.active === true,
          );
          const activeChoiceIds = activeChoices.map((choice) => choice._id);
          if (element1.item.code === QuestionTypeCode.S12) {
            choices = activeChoiceIds;
          } else if (element1.item.code === QuestionTypeCode.S10) {
            const sentences = await this.sentencesCollection
              .find({
                _id: { $in: activeChoiceIds },
              })
              .toArray();
            choices = sentences
              .map((item) => item.content)
              .filter((element) => element);
          } else if (element1.item.code === QuestionTypeCode.S7) {
            const words = await this.wordsCollection
              .find({
                _id: { $in: activeChoiceIds },
              })
              .toArray();
            choices = words
              .map((item) => item.content)
              .filter((element) => element);
          }
          const baseWord = sentence?.contentSplit[sentence.wordBaseIndex]?.text;
          subData[element.bookName].push([
            element1.bookId,
            element1.unitId,
            `${element1.level}`,
            element1.item._id,
            interaction,
            sentence.content,
            `${baseWord ? baseWord : ''}`,
            choices.join(', ').toString(),
            sentence._id,
            element1.item.code,
          ]);
        }
      }
      data.push(subData);
    }
    return data;
  }
  private getContent(code: QuestionTypeCode): string {
    switch (code) {
      case QuestionTypeCode.W3:
        return 'Chọn hình ảnh và nghĩa tương ứng';
      case QuestionTypeCode.W6:
        return 'Chọn từ phù hợp với âm thanh';
      case QuestionTypeCode.W11:
        return 'Nghe và viết lại';
      case QuestionTypeCode.W7:
        return 'Điền từ tiếng Anh tương ứng.';
      case QuestionTypeCode.W2:
        return 'Chọn ảnh của âm thanh và từ';
      case QuestionTypeCode.W4:
        return 'Chọn hình ảnh và âm thanh tương ứng';
      case QuestionTypeCode.W12:
        return 'Nói thành tiếng';
      case QuestionTypeCode.W9:
        return 'Nối cặp từ tương ứng';
      case QuestionTypeCode.W8:
        return 'Điền từ tiếng Việt tương ứng';
      case QuestionTypeCode.W13:
        return 'Tìm từ tiếng Anh tương ứng';
      case QuestionTypeCode.W14:
        return 'Điền từ tiếng Anh tương ứng';
      case QuestionTypeCode.W15:
        return 'Chọn nghĩa tương ứng với từ.';
      case QuestionTypeCode.S12:
        return 'Sắp xếp thành bản dịch đúng';
      case QuestionTypeCode.S10:
        return 'Chọn bản dịch đúng';
      case QuestionTypeCode.S1:
        return 'Nghe và sắp xếp từ thành câu cho đúng';
      case QuestionTypeCode.S2:
        return 'Dịch câu sau';
      case QuestionTypeCode.S17:
        return 'Sắp xếp các từ thành câu hoàn chỉnh';
      case QuestionTypeCode.S14:
        return 'Nghe và viết lại';
      case QuestionTypeCode.S7:
        return 'Nghe và chọn từ còn thiếu vào chỗ trống';
      case QuestionTypeCode.S15:
        return 'Nghe và điền từ còn thiếu vào chỗ trống';
      case QuestionTypeCode.S16:
        return 'Dịch câu sau';
      case QuestionTypeCode.S4:
        return 'Nói câu sau';
      case QuestionTypeCode.S18:
        return 'Hoàn thành bản dịch';
      default:
        return '';
    }
  }
}
