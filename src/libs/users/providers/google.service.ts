import { GoogleProfile } from '@dto/user/googleProfile.dto';
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleService {

    googleRedirect(req: any): any {
        if (!req.user) {
            const errorMessage = 'No user from google'
            return errorMessage
        }
        return {
            message: 'User information from google',
            user: req.user
        }
    }
    
    getUserData(accessToken: string): Promise<GoogleProfile> {
        return new Promise((resolve, reject) => {
            const OAuth2Client = new google.auth.OAuth2({});
            OAuth2Client.setCredentials({access_token: accessToken});
            const OAuth2 = google.oauth2({
                auth: OAuth2Client,
                version: "v2",
            });

            OAuth2.userinfo.get((error: any, res: any) => {
                if (error) {
                    reject(error);
                }
                else if (res.status == 200 && res.data) {
                    resolve(res.data);
                }
                else {
                    reject(res);
                }
            });
        });
    }
}