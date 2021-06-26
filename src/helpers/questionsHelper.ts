import { QuestionDocument } from "@entities/question.entity";
import { QuestionTypeCode } from "@utils/enums";
import { ListSentenceQuestionCodes, ListWorQuestionCodes } from "@utils/constants";

export class QuestionsHelper {

    public getContent(code: QuestionTypeCode): string {
        switch (code) {
            case QuestionTypeCode.W3:
                return "Chọn hình ảnh và nghĩa tương ứng";
            case QuestionTypeCode.W6:
                return "Chọn từ phù hợp với âm thanh";
            case QuestionTypeCode.W11:
                return "Nghe và viết lại";
            case QuestionTypeCode.W7:
                return "Điền từ tiếng Anh tương ứng.";
            case QuestionTypeCode.W2:
                return "Chọn ảnh của âm thanh và từ";
            case QuestionTypeCode.W4:
                return "Chọn hình ảnh và âm thanh tương ứng";
            case QuestionTypeCode.W12:
                return "Nói thành tiếng";
            case QuestionTypeCode.W9:
                return "Nối cặp từ tương ứng";
            case QuestionTypeCode.W8:
                return "Điền từ tiếng Việt tương ứng";
            case QuestionTypeCode.W13:
                return "Tìm từ tiếng Anh tương ứng";
            case QuestionTypeCode.W14:
                return "Điền từ tiếng Anh tương ứng";
            case QuestionTypeCode.S12:
                return "Sắp xếp thành bản dịch đúng";
            case QuestionTypeCode.S10:
                return "Chọn bản dịch đúng";
            case QuestionTypeCode.S1:
                return "Nghe và sắp xếp từ thành câu cho đúng";
            case QuestionTypeCode.S2:
                return "Dịch câu sau";
            case QuestionTypeCode.S17:
                return "Sắp xếp các từ thành câu hoàn chỉnh";
            case QuestionTypeCode.S14:
                return "Nghe và viết lại";
            case QuestionTypeCode.S7:
                return "Nghe và chọn từ còn thiếu vào chỗ trống";
            case QuestionTypeCode.S15:
                return "Nghe và điền từ còn thiếu vào chỗ trống";
            case QuestionTypeCode.S16:
                return "Dịch câu sau";
            case QuestionTypeCode.S4:
                return "Nói câu sau";
            case QuestionTypeCode.S18:
                return "Hoàn thành bản dịch";
            default:
                return "";
        }
    }

    public getInteraction(code: QuestionTypeCode): string {
        switch (code) {
            case QuestionTypeCode.W2:
            case QuestionTypeCode.W3:
            case QuestionTypeCode.W4:
            case QuestionTypeCode.W6:
            case QuestionTypeCode.W13:
            case QuestionTypeCode.S7:
            case QuestionTypeCode.S10:
                return "Choice";
            case QuestionTypeCode.W12:
            case QuestionTypeCode.S4:
                return "Voice";
            case QuestionTypeCode.W7:
            case QuestionTypeCode.W8:
            case QuestionTypeCode.W11:
            case QuestionTypeCode.W14:
            case QuestionTypeCode.S18:
            case QuestionTypeCode.S15:
            case QuestionTypeCode.S14:
            case QuestionTypeCode.S16:
                return "Writing";
            case QuestionTypeCode.W9:
                return "Matching";
            case QuestionTypeCode.S1:
            case QuestionTypeCode.S2:
            case QuestionTypeCode.S12:
            case QuestionTypeCode.S17:
                return "Reorder";
            default:
                return "";
        }
    }

    public getQuestionOutPut(question: QuestionDocument) {
        if (ListWorQuestionCodes.includes(question.code)) {
            return {
                _id: question._id,
                code: question.code,
                skills: [],
                interaction: this.getInteraction(question.code),
                focusWord: question.focus,
                point: 0,
                words: question.choices,
                unitId: "",
                bookId: "",
                content: this.getContent(question.code),
            };
        }
        else {
            return {
                _id: question._id,
                skills: [],
                interaction: this.getInteraction(question.code),
                point: 0,
                focusSentence: question.focus,
                sentences: question.code == QuestionTypeCode.S10 ? question.choices : [],
                wrongWords: question.code != QuestionTypeCode.S10 ? question.choices : [],
                hiddenWord: question.hiddenIndex,
                checkSentence: question.focus,
                unitId: "",
                bookId: "",
                content: this.getContent(question.code),
                code: question.code
            };
        }
    }
}