import { Injectable } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
    constructor() {
        super({
            clientID: '324300079195508',
            clientSecret: 'e8a3e487098865e10bf16ffb06b2c122',
            callbackURL: "http://localhost:8080/facebook/redirect",
            scope: "email",
            profileFields: ["emails", "name"],
        });
    }
    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (err: any, user: any, info?: any) => void
    ): Promise<any> {
        const { name, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            avatar: photos,
        };
        const payload = {user, accessToken};
        done(null, payload);
    }
}