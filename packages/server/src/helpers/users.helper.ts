import { UserDocument } from '@entities/user.entity';
import { UserProfile } from '@dto/user/userProfile.dto';
import { SearchUser } from '@dto/user';
import { ProvinceDocument } from '@entities/province.entity';
import { DistrictDocument } from '@entities/district.entity';
import { SchoolDocument } from '@entities/school.entity';
import { LeanDocument } from 'mongoose';

export class UsersHelper {
  public mapToUserProfile(user: UserDocument): UserProfile {
    const province = user?.address?.province as unknown as ProvinceDocument;
    const district = user?.address?.district as unknown as DistrictDocument;
    const school = user?.address?.school as unknown as SchoolDocument;
    const grade = user?.address?.grade;
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
        province: province ? { _id: province._id, name: province.name } : {},
        district: district ? { _id: district._id, name: district.name } : {},
        school: school ? { _id: school._id, name: school.name } : {},
        grade: grade ? grade : -1,
      },
      enableNotification: user.enableNotification,
    };
  }

  public mapToFollowingResult(
    listFollowings: string[],
    searchUserResult: LeanDocument<UserDocument>[],
  ): SearchUser[] {
    return searchUserResult.map((user): SearchUser => {
      const userId = String(user._id);
      return {
        userId: userId,
        email: user.email,
        avatar: user.avatar,
        displayName: user.displayName,
        followed: listFollowings.includes(userId),
      };
    });
  }
}
