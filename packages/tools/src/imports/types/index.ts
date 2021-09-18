export type NewBookDemo = {
  description: string;
  totalWords: number;
  totalSentences: number;
  totalUnits: number;
  totalQuestions: number;
  totalLessons: number;
  nId: number;
  cover: string;
  grade: number;
  name: string;
  imgName: string;
};

export type WordInSheet = {
  _id: string;
  meanings: string[];
  pronunciations: string[];
  types: string[];
  haveImageWords: string[];
  noImageWords: string[];
  bookNId: number;
  unitNId: number;
  content: string;
  meaning: string;
  imageRoot: string;
  isUseToMakeQuestion: boolean;
};

export type SentenceInSheet = {
  _id: string;
  translates: string[];
  tempTranslates: string[];
  replaceWords: string[];
  questionSection: string;
  contextSection: string;
  lowerBound: number;
  upperBound: number;
  isConversation: boolean;
  bookNId: number;
  unitNId: number;
  position: number;
  baseId: string;
  content: string;
  phrase: string;
  wordBaseIndex: number;
  translate: string;
  audio: string;
  contentSplit: ContentSplitType[];
  translateSplit: TranslateSplitType[];
};

export type ContentSplitType = {
  _id: string;
  wordId: string;
  text: string;
  types: Array<string>;
};
export type TranslateSplitType = {
  _id: string;
  text: string;
  isFocus: boolean;
};

export type SpreadsheetAnalysisParam = {
  sheetName: string;
  bookNId: number;
  unitNId: number;
  imageRoot: string;
};

export type SentenceSmoothingParam = {
  baseIdCol: string;
  wordBaseCol: string;
  bookNIdCol: number;
  unitNIdCol: number[];
  contentCol: string;
  meaningCol: string;
  phraseCol: string;
  audioCol: string;
  grade: number;
};

export type WordSmoothingParam = {
  wordIdCol: string;
  contentCol: string;
  meaningCol: string;
  signature: string;
  imageRootCol: string;
  pronunciationCol: string;
  bookNIdCol: number;
  unitNIdCol: number[];
};
