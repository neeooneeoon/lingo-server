import { UserDocument } from '@entities/user.entity';
import { UserProfile } from '@dto/user/userProfile.dto';
import { SearchUser } from '@dto/user';

export class UsersHelper {
  public mapToUserProfile(user: UserDocument): UserProfile {
    return {
      email: user.email,
      avatar: user.avatar,
      displayName: user.displayName,
      role: user.role,
      level: user.level,
      score: user.score,
      streak: user.streak,
      lastActive: user.lastActive,
      grade: user.grade,
      xp: user.xp,
      rank: user.rank,
      userId: String(user._id),
      createdAt: user.createdAt,
    };
  }

  public mapToFollowingResult(
    listFollowings: string[],
    searchUserResult: UserDocument[],
  ): SearchUser[] {
    const result = searchUserResult.map((user): SearchUser => {
      const userId = String(user._id);
      return {
        userId: userId,
        email: user.email,
        avatar: user.avatar,
        displayName: user.displayName,
        followed: listFollowings.includes(userId),
      };
    });
    return result;
  }
}
