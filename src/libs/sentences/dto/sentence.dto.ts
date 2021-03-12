export class SentenceDataOfLesson {
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
}