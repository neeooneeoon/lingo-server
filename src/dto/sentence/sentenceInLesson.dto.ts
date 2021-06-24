export class SentenceInLesson {
    _id: string;
    audio: string;
    enText: string;
    vnText: string;
    vn: {
        _id: string,
        wordId: string,
        text: string,
    }[];
    en: {
        _id: string,
        wordId: string,
        text: string,
    }[];
    lowerBound: number;
    upperBound: number;
    isConversation: boolean;
    questionSection: string;
    contextSection: string;
}