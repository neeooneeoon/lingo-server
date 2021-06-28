import {  UserDocument } from '@entities/user.entity';
import { UserProfile } from '@dto/user/userProfile.dto';

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
    public mapToSearchUserProfile(user: UserDocument): Partial<UserProfile>{
        return {
            email: user.email,
            avatar: user.avatar,
            displayName: user.displayName
        }
    }
}