import { ScoreStatisticDocument } from '@entities/scoreStatistic.entity';
import { UserDocument } from '@entities/user.entity';

export class ScoreStatisticsHelper {
  public getFirstUserNotNull(
    xpStatistics: ScoreStatisticDocument[],
  ): UserDocument {
    for (const item of xpStatistics) {
      const user = item.user as unknown as UserDocument;
      if (user) return user;
    }
    return null;
  }
}
