import { UserDocument } from '@entities/user.entity';
import { UserProfile } from '@dto/user/userProfile.dto';
import { SearchUser } from '@dto/user';
import { ProvinceDocument } from '@entities/province.entity';
import { DistrictDocument } from '@entities/district.entity';
import { SchoolDocument } from '@entities/school.entity';
import { LeanDocument } from 'mongoose';

export class UsersHelper {
  public mapToUserProfile(user: UserDocument): UserProfile & { ranking?: any } {
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
      showRatingDialog: user.showRatingDialog,
      ranking: user.ranking
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

  public fragments(n: number, size: number) {
    if (n < size) return [n];
    const total = Math.floor(n / size);
    const remainder = n % size;
    const result = new Array<number>(total).fill(0);

    let i = 0,
      j = 0;

    while (true) {
      if (total < remainder) {
        if (i < total) {
          if (result[i] === 0) {
            result[i] = size + 1;
          } else {
            result[i] = result[i] + 1;
          }
          i++;
          j++;
        }
        if (i >= total) i = 0;
        if (j >= remainder) break;
      } else {
        if (i < total) {
          if (i < remainder) {
            result[i] = size + 1;
          } else {
            result[i] = size;
          }
          i++;
          j++;
        }
        if (i >= total) break;
      }
    }
    return result;
  }
}
