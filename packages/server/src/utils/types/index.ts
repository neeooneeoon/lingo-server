import { Role } from '@utils/enums';
import { Types } from 'mongoose';
import { AddWordDto } from '@dto/evaluation';

export class JwtPayLoad {
  userId: string;
  role: Role;
}

export class DistractedChoice {
  _id: string;
  active: boolean;
}

export class StorySentenceSplit {
  _id: Types.ObjectId;
  end: string;
  start: string;
  content: string;
}

export class StorySentence {
  _id: Types.ObjectId;
  begin: string;
  end: string;
  speaker: string;
  content: string;
  splitSentences: StorySentenceSplit[];
  questions: Types.ObjectId[];
}

export interface WordInEvaluation
  extends Partial<Omit<AddWordDto, 'codes' | 'proficiency'>> {
  id: string;
  codes: FirebaseFirestore.FieldValue;
  content: string;
  meaning: string;
  imageRoot: string;
  proficiency: FirebaseFirestore.FieldValue;
  bookId: string;
  unitId: string;
  level: number;
}

export class BookProgressMetaData {
  doneLessons: number;
  doneQuestions: number;
  bookId: string;
}
