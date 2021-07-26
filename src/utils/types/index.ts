import { Role } from '@utils/enums';
import { Types } from 'mongoose';

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
  _id: number;
  end: string;
  start: string;
  content: string;
  splitSentences: Array<StorySentenceSplit>;
  bookId: string;
  unitId: string;
}
