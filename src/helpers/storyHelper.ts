import { StoryQuestionDocument } from '@entities/storyQuestion.entity';
import { ListWorQuestionCodes } from '@utils/constants';
import { QuestionsHelper } from '@helpers/questionsHelper';
import { QuestionTypeCode } from '@utils/enums';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StoryHelper {
  constructor(private quetionsHelper: QuestionsHelper) {}
  public mapToWordQuestion(storyQuestion: StoryQuestionDocument) {
    const serialization: Array<string> = [];
    if (storyQuestion.choices.length > 0) {
      storyQuestion.choices.map((choice) => {
        if (choice.active) serialization.push(choice._id);
      });
    }
    if (ListWorQuestionCodes.includes(storyQuestion.code)) {
      return {
        _id: storyQuestion._id,
        code: storyQuestion.code,
        skills: [],
        interaction: this.quetionsHelper.getInteraction(storyQuestion.code),
        focusWord: storyQuestion.focus,
        point: 0,
        words: serialization,
        unitId: '',
        bookId: '',
        content: this.quetionsHelper.getContent(storyQuestion.code),
      };
    } else {
      return {
        _id: storyQuestion._id,
        skills: [],
        interaction: this.quetionsHelper.getInteraction(storyQuestion.code),
        point: 0,
        focusSentence: storyQuestion.focus,
        sentences:
          storyQuestion.code == QuestionTypeCode.S10 ? serialization : [],
        wrongWords:
          storyQuestion.code != QuestionTypeCode.S10 ? serialization : [],
        hiddenWord: storyQuestion.hiddenIndex,
        checkSentence: storyQuestion.focus,
        unitId: '',
        bookId: '',
        content: this.quetionsHelper.getContent(storyQuestion.code),
        code: storyQuestion.code,
      };
    }
  }
}
