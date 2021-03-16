import { RankEnum } from "../schema/user.schema";

export class UserProfile {
    email: string;
    avatar: string;
    displayName: string;
    role: string;
    level: number;
    score: number;
    streak: number;
    lastActive: Date;
    grade: number;
    xp: number;
    rank: RankEnum
}

export class UserLoginResponse {
    user: UserProfile;
    token: string;
    refreshToken: string;
}

export class GoogleProfile {
    email: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
}

export class FacebookProfile {
    id: string;
    last_name: string;
    picture: {
        data: {
            height: number;
            is_silhouette: boolean;
            url: string;
            width: number;
        };
    };
    first_name: string;
    name: string;
    email: string;
}