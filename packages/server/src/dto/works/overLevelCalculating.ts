import { AnswerResult } from '../lesson';
import { WorkInfo } from './workInfo.dto';

export class OverLevelCalculating {
  bookId: string;
  unitId: string;
  levelIndex: number;
  workInfo: WorkInfo;
  results: AnswerResult[];
}
