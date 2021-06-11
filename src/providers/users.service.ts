import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "@entities/user.entity";
import { Model } from "mongoose";
import { UserProfile } from '@dto/user/userProfile.dto';
import { SuccessResponse } from '@utils/types';
import { GoogleProfile } from '@dto/user/googleProfile.dto';
import { UserLogin } from '@dto/user/userLogin.dto';
import { google } from 'googleapis';
import { UsersHelper } from '@helpers/users.helper';
import { AuthenticationService } from '@authentication/authentication.service';
import { GoogleService } from './google.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly usersHelper: UsersHelper,
        private authService: AuthenticationService,
    ) { }

    googleRedirect(req: any) {
        if (!req.user) {
            return 'No user from google'
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
            const { email } = tokenInfo;
            if (!email) {
                throw new BadRequestException('Invalid accessToken');
            }
            else {
                const existsUser = await this.userModel.findOne({ email: email });
                if (existsUser) {
                    const userProfile = this.usersHelper.mapToUserProfile(existsUser);
                    const token = this.authService.generateToken({userId: existsUser._id, role: existsUser.role});
                    const refreshToken = this.authService.generateRefreshToken({userId: existsUser._id, role: existsUser.role});
                    return {
                        user: userProfile,
                        token: token,
                        refreshToken: refreshToken, 
                    }
                }
                else {

                }
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

}