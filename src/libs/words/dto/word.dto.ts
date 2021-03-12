export class WordDataOfLesson {
    _id: string;
    content: string;
    types: string[];
    meaning: string;
    imageRoot: string;
    pronunciations: string[];
}


export class NewWord {
    _id: string;
    bookNId: number;
    unitNId: number;
    content: string;
    meaning: string;
    meanings: Array<string>;
    imageRoot: string;
    isUseToMakeQuestion: boolean;
}
