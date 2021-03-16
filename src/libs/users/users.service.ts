import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from 'src/authentication/auth.service';
import { google } from "googleapis";
import { InjectModel } from '@nestjs/mongoose';
import { RankEnum, User, UserDocument } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import { UserHelper } from 'src/helper/user.helper';
import { ProgressesService } from 'src/libs/progresses/progresses.service';
import { UserLoginResponse } from './dto/user-profile.dto';
@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly athService: AuthService,
    private readonly userHelper: UserHelper,
    private readonly progressService: ProgressesService,
  ) { }
  async login() {
    const token = await this.athService.generateToken({ userId: "601215f185b09a6e0c44de50", role: "Member" });
    return {
      token: token
    }
  }
  googleLogin(req) {
    if (!req.user) {
      return 'No user from google'
    }

    return {
      message: 'User information from google',
      user: req.user
    }
  }
  async googleLoginServerHandle(access_token: string): Promise<UserLoginResponse> {
    try {
      const oAuth2Client = new google.auth.OAuth2({});
      const tokenInfo = await oAuth2Client.getTokenInfo(access_token);
      const { email } = tokenInfo;
      if (!email) {
        throw new BadRequestException('Invalid accessToken')
      }
      else {
        const user = await this.userModel.findOne({ email: email });
        if (user) {
          return {
            user: this.userHelper.mapToUserProfile(user),
            token: this.athService.generateToken({ userId: user.id, role: user.role }),
            refreshToken: this.athService.generateRefreshToken({ userId: user.id, role: user.role })
          }
        }
        else {
          const userGoogleProfile = await this.userHelper.getUserGoogleData(access_token);
          const user = await this.userModel.create({
            facebookId: -1,
            email: userGoogleProfile.email,
            avatar: userGoogleProfile.picture,
            givenName: userGoogleProfile.given_name,
            familyName: userGoogleProfile.family_name,
            displayName: userGoogleProfile.name,
            grade: 0,
            xp: 0,
            level: 0,
            score: 0,
            rank: RankEnum.None,
            role: "Member",
            loginCount: 0,
            streak: 0,
            lastActive: new Date()
          })
          await this.progressService.create({ userId: user.id, books: [] });
          return {
            user: this.userHelper.mapToUserProfile(user),
            token: this.athService.generateToken({ userId: user.id, role: user.role }),
            refreshToken: this.athService.generateRefreshToken({ userId: user.id, role: user.role })
          }
        }
      }
    }
    catch (e) {
      throw new InternalServerErrorException(e)
    }
  }
  async facebookLoginServiceHandle(access_token: string): Promise<UserLoginResponse> {
    try {
      const userProfile = await this.userHelper.queryMeFacebookByAccessToken(access_token);
      if (!userProfile) {
        throw new BadRequestException('Can not find user facebook')
      }
      let user: UserDocument;
      if (userProfile.email) {
        user = await this.userModel.findOne({ email: userProfile.email });
        if (!user) {
          user = await this.userModel.findOne({ facebookId: userProfile.id });
        }
      }
      else {
        user = await this.userModel.findOne({ facebookId: userProfile.id })
      }
      if (user) {
        return {
          user: this.userHelper.mapToUserProfile(user),
          token: this.athService.generateToken({ userId: user.id, role: user.role }),
          refreshToken: this.athService.generateRefreshToken({ userId: user.id, role: user.role })
        }
      }
      else {
        user = await this.userModel.create({
          facebookId: userProfile.id,
          email: userProfile.email,
          avatar: userProfile.picture.data.url,
          givenName: userProfile.first_name,
          familyName: userProfile.last_name,
          displayName: userProfile.name,
          grade: 0,
          xp: 0,
          level: 0,
          score: 0,
          rank: RankEnum.None,
          role: "Member",
          loginCount: 0,
          streak: 0,
          lastActive: new Date()
        })
        await this.progressService.create({ userId: user.id, books: [] });
        return {
          user: this.userHelper.mapToUserProfile(user),
          token: this.athService.generateToken({ userId: user.id, role: user.role }),
          refreshToken: this.athService.generateRefreshToken({ userId: user.id, role: user.role })
        }
      }
    }
    catch (e) {
      throw new InternalServerErrorException(e)
    }
  }
  async queryMe(userId: string | Types.ObjectId) {
    const user = await this.userModel.findById(userId)
    return this.userHelper.mapToUserProfile(user)
  }
}
