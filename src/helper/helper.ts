import { Question } from "src/libs/question-holders/schema/question-holder.schema";
import { SentenceQuestion, WordQuestion } from "src/libs/units/schema/unit.schema";

export const getInteraction = (group: string, type: number): string => {
    switch (group) {
        case "word":
            {
                switch (type) {
                    case 2: case 3: case 4: case 6: case 13:
                        return "Choice";
                    case 12:
                        return "Voice";
                    case 7: case 8: case 11: case 14:
                        return "Writing";
                    case 9:
                        return "Matching";
                    default:
                        return "";
                }
            }
        case "sentence":
            {
                switch (type) {
                    case 7: case 10:
                        return "Choice";
                    case 18: case 15: case 14: case 16:
                        return "Writing";
                    case 1: case 2: case 12: case 17:
                        return "Reorder";
                    case 4:
                        return "Voice";
                    default:
                        return "";
                }
            }
        default:
            return "";
    }
};
export const getContent = function (group: string, type: number): string {
    switch (group) {
        case "word":
            {
                switch (type) {
                    case 3:
                        return "Chọn hình ảnh và nghĩa tương ứng";
                    case 6:
                        return "Chọn từ phù hợp với âm thanh";
                    case 11:
                        return "Nghe và viết lại";
                    case 7:
                        return "Điền từ tiếng Anh tương ứng.";
                    case 2:
                        return "Chọn ảnh của âm thanh và từ";
                    case 1:
                        return "Chọn ảnh của từ";
                    case 4:
                        return "Chọn hình ảnh và âm thanh tương ứng";
                    case 12:
                        return "Nói thành tiếng";
                    case 9:
                        return "Nối cặp từ tương ứng";
                    case 8:
                        return "Điền từ tiếng Việt tương ứng";
                    case 13:
                        return "Tìm từ tiếng Anh tương ứng";
                    case 14:
                        return "Điền từ tiếng Anh tương ứng";
                }
                return "";
            }
        case "sentence":
            {
                switch (type) {
                    case 12:
                        return "Sắp xếp thành bản dịch đúng";
                    case 10:
                        return "Chọn bản dịch đúng";
                    case 1:
                        return "Nghe và sắp xếp từ thành câu cho đúng";
                    case 13:
                        return "Nối bản dịch đúng";
                    case 2:
                        return "Dịch câu sau";
                    case 17:
                        return "Sắp xếp các từ thành câu hoàn chỉnh";
                    case 14:
                        return "Nghe và viết lại";
                    case 7:
                        return "Nghe và chọn từ còn thiếu vào chỗ trống";
                    case 15:
                        return "Nghe và điền từ còn thiếu vào chỗ trống";
                    case 16:
                        return "Dịch câu sau";
                    case 4:
                        return "Nói câu sau";
                    case 18:
                        return "Hoàn thành bản dịch";
                }
                return "";
            }
    }
};
export function getQuestionType(group: string, content: string): number {
    switch (group) {
        case "word":
            {
                switch (content) {
                    case "Chọn hình ảnh và nghĩa tương ứng":
                        return 3;
                    case "Chọn từ phù hợp với âm thanh":
                        return 6;
                    case "Nghe và viết lại":
                        return 11;
                    case "Điền từ tiếng Anh tương ứng.":
                        return 7;
                    case "Chọn ảnh của âm thanh và từ":
                        return 2;
                    case "Chọn ảnh của từ":
                        return 1;
                    case "Chọn hình ảnh và âm thanh tương ứng":
                        return 4;
                    case "Nói thành tiếng":
                        return 12;
                    case "Nối cặp từ tương ứng":
                        return 9;
                    case "Điền từ tiếng Việt tương ứng":
                        return 8;
                    case "Tìm từ tiếng Anh tương ứng":
                        return 13;
                    case "Điền từ tiếng Anh tương ứng":
                        return 14;
                }
                return -1;
            }
        case "sentence":
            {
                switch (content) {
                    case "Sắp xếp thành bản dịch đúng":
                        return 12;
                    case "Chọn bản dịch đúng":
                        return 10;
                    case "Nghe và sắp xếp từ thành câu cho đúng":
                        return 1;
                    case "Nối bản dịch đúng":
                        return 13;
                    case "Dịch câu sau":
                        return 2;
                    case "Sắp xếp các từ thành câu hoàn chỉnh":
                        return 17;
                    case "Nghe và viết lại":
                        return 14;
                    case "Nghe và chọn từ còn thiếu vào chỗ trống":
                        return 7;
                    case "Nghe và điền từ còn thiếu vào chỗ trống":
                        return 15;
                    case "Nói câu sau":
                        return 4;
                    case "Hoàn thành bản dịch":
                        return 18;
                }
                return -1;
            }
    }
}
export function isWordQuestion(question: Question): boolean {
    return question.group == "word";
}

export function checkIsWordQuestion(question: WordQuestion | SentenceQuestion): question is WordQuestion {
    return question.type == "word";
}

export const getQuestionOutPut = function (question: Question): WordQuestion | SentenceQuestion {
    if (question.group == "word") {
        return {
            _id: question._id,
            type: question.group,
            skills: [],
            interaction: getInteraction(question.group, question.type),
            focusWord: question.focus,
            point: 0,
            questionType: Math.floor(question.type),
            words: question.choices,
            unitId: "",
            bookId: "",
            content: getContent(question.group, question.type),
        };
    } else {
        return {
            _id: question._id,
            type: question.group,
            skills: [],
            questionType: Math.floor(question.type),
            interaction: getInteraction(question.group, question.type),
            point: 0,
            focusSentence: question.focus,
            sentences: question.type == 10 ? question.choices : [],
            wrongWords: question.type != 10 ? question.choices : [],
            hiddenWord: question.hiddenIndex,
            checkSentence: question.focus,
            unitId: "",
            bookId: "",
            content: getContent(question.group, question.type),
        };
    }
};
