import { UserDocument } from '@entities/user.entity';
import { UserProfile } from '@dto/user/userProfile.dto';
import { SearchUser } from '@dto/user';
import { ProvinceDocument } from '@entities/province.entity';
import { DistrictDocument } from '@entities/district.entity';
import { SchoolDocument } from '@entities/school.entity';

export class UsersHelper {
  public mapToUserProfile(user: UserDocument): UserProfile {
    const province = user.address.province as unknown as ProvinceDocument;
    const district = user.address.district as unknown as DistrictDocument;
    const school = user.address.school as unknown as SchoolDocument;
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
      address: {
        province: province ? province.name : '',
        district: district ? district.name : '',
        school: school ? school.name : '',
      },
      enableNotification: user.enableNotification,
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
