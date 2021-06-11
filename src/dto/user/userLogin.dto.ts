import { UserProfile } from './userProfile.dto';

export class UserLogin {
    user: UserProfile;
    token: string;
    refreshToken: string;
}