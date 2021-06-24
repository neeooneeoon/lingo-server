import { QuestionDocument } from "@entities/question.entity";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { QuestionTypeCode } from "@utils/enums";

@Injectable()
export class PointService {
    public getQuestionPoint(question: QuestionDocument): number {
        try {
            if (
                [
                    QuestionTypeCode.W2, QuestionTypeCode.W3,
                    QuestionTypeCode.W4, QuestionTypeCode.W6,
                    QuestionTypeCode.W13
                ].includes(question.code)
            ) {
                return 1;
            }
            if ([QuestionTypeCode.W9].includes(question.code)) {
                return 2;
            }
            if ([QuestionTypeCode.W7, QuestionTypeCode.W11, QuestionTypeCode.W12].includes(question.code)) {
                return 3;
            }
            if ([QuestionTypeCode.W8, QuestionTypeCode.W14].includes(question.code)) {
                return 4;
            }
            if ([QuestionTypeCode.S10, QuestionTypeCode.S12, QuestionTypeCode.S2].includes(question.code)) {
                return 2;
            }
            if (
                [
                    QuestionTypeCode.S1, QuestionTypeCode.S17,
                    QuestionTypeCode.S7, QuestionTypeCode.S4
                ].includes(question.code)
            ) {
                return 3;
            }
            if (
                [
                    QuestionTypeCode.S14, QuestionTypeCode.S15,
                    QuestionTypeCode.S16, QuestionTypeCode.S18
                ].includes(question.code)
            ) {
                return 4;
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public getBonusStreak(currentStreak: number): number {
        try {
            let bonusStreak = 0;
            if (currentStreak == 0)
                bonusStreak = 0;
            else if (currentStreak == 1)
                bonusStreak = 0.25;
            else if (currentStreak == 2)
                bonusStreak = 0.5;
            else if (currentStreak >= 3)
                bonusStreak = 1;
            else if (currentStreak <= 5)
                bonusStreak = 1.5;
            else if (currentStreak <= 10)
                bonusStreak = 2;
            else if (currentStreak <= 15)
                bonusStreak = 2.5;
            else if (currentStreak <= 20)
                bonusStreak = 2.75;
            else
                bonusStreak = 3;
            return bonusStreak;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}