import { LeanDocument } from 'mongoose';
import { WordDocument } from '@entities/word.entity';
import { QuestionTypeCode } from '@utils/enums';

export class EvaluateWordDto {
  word: LeanDocument<
    Pick<WordDocument, '_id' | 'content' | 'meaning' | 'imageRoot'>
  >;
  bookId: string;
  unitId: string;
  level: number;
  codes: QuestionTypeCode[];
}
