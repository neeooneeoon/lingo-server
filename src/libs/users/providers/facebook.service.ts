import { FacebookProfile } from "@dto/user";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import fetch from 'node-fetch';

@Injectable()
export class FacebookService {


    async getUserData(accessToken: string): Promise<FacebookProfile> {
        try {
            const URL = `https://graph.facebook.com/me?fields=picture, email, id, name, first_name, last_name&access_token=${accessToken}`;
            try {
                const res = await fetch(URL);
                return await (res.json() as Promise<FacebookProfile>);
            } catch (error) {
                throw new InternalServerErrorException(error);
            }
            
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }


}