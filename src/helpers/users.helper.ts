import {  UserDocument } from '@entities/user.entity';
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
        }
    }
    public mapToSearchUserProfile(user: UserDocument): SearchUser{
        return {
            userId: String(user._id),
            email: user.email,
            avatar: user.avatar,
            displayName: user.displayName
        }
    }

    public mapToFollowingResult(listFollowings: string[], searchUserResult: UserDocument[]) {
        const result =  searchUserResult.map(user => {
            const userId = String(user._id);
            if (listFollowings.includes(userId)) {
                return {
                    userId: userId,
                    email: user.email,
                    avatar: user.avatar,
                    displayName: user.displayName,
                    followed: true
                }
            }
            else {
                return {
                    userId: userId,
                    email: user.email,
                    avatar: user.avatar,
                    displayName: user.displayName,
                    followed: false
                }
            }
        });
        return result;
    }
}