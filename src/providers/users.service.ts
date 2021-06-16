import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { google } from 'googleapis';
import { User, UserDocument } from "@entities/user.entity";
import { AuthenticationService } from '@authentication/authentication.service';
import { GoogleService } from './google.service';
import { ProgressesService } from "./progresses.service";
import { UsersHelper } from '@helpers/users.helper';
import { Rank } from '@utils/enums';
import { UserLogin } from '@dto/user/userLogin.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly usersHelper: UsersHelper,
        private authService: AuthenticationService,
        private googleService: GoogleService,
        private progressesService: ProgressesService,
    ) { }

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
    async googleLoginHandle(accessToken: string): Promise<UserLogin> {
        try {
            const OAuth2Client = new google.auth.OAuth2({});
            const tokenInfo = await OAuth2Client.getTokenInfo(accessToken);
            console.log(tokenInfo)
            const { email } = tokenInfo;
            if (!email) {
                throw new BadRequestException('Invalid accessToken');
            }
            else {
                const existsUser = await this.userModel.findOne({ email: email });
                if (existsUser) {
                    const userProfile = this.usersHelper.mapToUserProfile(existsUser);
                    const token = this.authService.generateToken({ userId: existsUser._id, role: existsUser.role });
                    const refreshToken = this.authService.generateRefreshToken({ userId: existsUser._id, role: existsUser.role });
                    return {
                        user: userProfile,
                        token: token,
                        refreshToken: refreshToken,
                    }
                }
                else {
                    const {
                        email,
                        picture,
                        given_name,
                        family_name,
                        name,
                    } = await this.googleService.getUserData(accessToken);

                    const user = await this.userModel.create({
                        facebookId: -1,
                        email: email,
                        avatar: picture,
                        givenName: given_name,
                        familyName: family_name,
                        displayName: name,
                        grade: 0,
                        xp: 0,
                        level: 0,
                        score: 0,
                        rank: Rank.None,
                        role: "Member",
                        loginCount: 0,
                        streak: 0,
                        lastActive: new Date()
                    })
                }
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

}