import { ScoreStatisticDocument } from '@entities/scoreStatistic.entity';
import { UserDocument } from '@entities/user.entity';
import { LeanDocument } from 'mongoose';

export class ScoreStatisticsHelper {
  public getFirstUserNotNull(
    xpStatistics: LeanDocument<ScoreStatisticDocument>[],
  ): UserDocument {
    for (const item of xpStatistics) {
      const user = item.user as unknown as UserDocument;
      if (user) return user;
    }
    return null;
  }
}
