import { UserDocument } from 'src/libs/users/schema/user.schema';
import { google } from "googleapis";
import { InternalServerErrorException } from '@nestjs/common';
import { UserProfile, FacebookProfile, GoogleProfile } from 'src/libs/users/dto/user-profile.dto';
import Axios from 'axios';

export class UserHelper {
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
            rank: user.rank
        }
    }
    public async getUserGoogleData(access_token: string): Promise<GoogleProfile> {
        return new Promise((resolve, reject) => {
            const oAuth2Client = new google.auth.OAuth2({});
            oAuth2Client.setCredentials({ access_token: access_token });
            const Oauth2 = google.oauth2({
                auth: oAuth2Client,
                version: "v2"
            });

            Oauth2.userinfo.get((err: any, res: any) => {
                if (err) {
                    reject(err);
                } else if (res.status == 200 && res.data) {
                    resolve(res.data);
                } else {
                    reject(res);
                }
            });
        });
    }
    public async queryMeFacebookByAccessToken(access_token: string): Promise<FacebookProfile | void> {
        try {
            const facebookProfile = await Axios.get(`https://graph.facebook.com/me?fields=picture, email, id, name, first_name, last_name&access_token=${access_token}`)
            .then((res: { data: FacebookProfile }) => {
                if (res.data) {
                    return res.data
                }
            })
            .catch(e => {
                throw new InternalServerErrorException(e)
            })
            return facebookProfile;
        }
        catch (e) {
            throw new InternalServerErrorException(e)
        }
    }
}