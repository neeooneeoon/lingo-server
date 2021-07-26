from enum import Enum


class QuestionTypeCode(Enum):
    W3 = 'P1-I1W2-C'
    W6 = 'P1-W1-C'
    W11 = 'P1-W1-W'
    W7 = 'P1I1-W1-W'
    W2 = 'P1W1-I1-C'
    W4 = 'W1-I1P1-C'
    W12 = 'P1W1-P1-V'
    W9 = 'W1-W2-M'
    W8 = 'W1-W2-W'
    W13 = 'W2-W1-C'
    W14 = 'W2-W1-W'
    W15 = 'W1-W2-C'
    S12 = 'S1-S2-R'
    S10 = 'S2-S1-C'
    S1 = 'A1-S1-R'
    S2 = 'S2-S1-R'
    S14 = 'A1-S1-W'
    S17 = 'S1-S1-R'
    S7 = 'A1-W1S1-C'
    S15 = 'A1-S1-W'
    S16 = 'A1S1-S2-W'
    S4 = 'A1S1-A1-V'
    S18 = 'S2-S1-W'


unused_books = ['tienganh1macmillan', 'tienganh2macmillan']

story_question_codes = [
    QuestionTypeCode.W15.value,
    QuestionTypeCode.S7.value,
    QuestionTypeCode.W13.value,
    # QuestionTypeCode.W9.value,
    QuestionTypeCode.W12.value,
    QuestionTypeCode.W11.value,
    QuestionTypeCode.S17.value
]
