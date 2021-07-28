import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@entities/user.entity';
import { Model } from 'mongoose';
import { NotificationsService } from '@libs/notifications/providers/notifications.service';
import { Account, Rank, Role } from '@utils/enums';
import { FetchAccountInfo, LoginBodyDto, UserLogin } from '@dto/user';
import { GoogleService } from '@libs/users/providers/google.service';
import { FacebookService } from '@libs/users/providers/facebook.service';
import { UsersHelper } from '@helpers/users.helper';
import { AuthenticationService } from '@authentication';
import { ProgressesService } from '@libs/progresses/progresses.service';
import { DEFAULT_AVATAR } from '@utils/constants';

@Injectable()
export class LoginService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationsService: NotificationsService,
    private googleService: GoogleService,
    private facebookService: FacebookService,
    private authService: AuthenticationService,
    private usersHelper: UsersHelper,
    private progressesService: ProgressesService,
  ) {}

  public async getUserByIdentifier(
    identifier: string,
    account: Account,
  ): Promise<UserDocument | null> {
    switch (account) {
      case Account.Google:
        return this.userModel.findOne({
          email: identifier,
        });
      case Account.Facebook:
        return this.userModel.findOne({
          facebookId: identifier,
        });
      case Account.Apple:
        return this.userModel.findOne({
          appleId: identifier,
        });
      default:
        return undefined;
    }
  }

  public async storeNewUser(info: FetchAccountInfo): Promise<UserDocument> {
    return this.userModel.create({
      ...info,
      grade: 0,
      xp: 0,
      level: 0,
      score: 0,
      rank: Rank.None,
      role: Role.Member,
      loginCount: 0,
      streak: 0,
      lastActive: new Date(),
      address: { province: -1, district: -1 },
      enableNotification: false,
    });
  }

  public async login(
    info: FetchAccountInfo,
    account: Account,
  ): Promise<UserLogin> {
    const user = await this.getUserByIdentifier(info.identifier, account);
    if (user) {
      await this.notificationsService.storeDeviceToken(
        String(user._id),
        info.deviceToken,
      );
      const profile = this.usersHelper.mapToUserProfile(user);
      const token = this.authService.generateToken({
        userId: user._id,
        role: user.role,
      });
      return {
        user: profile,
        token: token,
        refreshToken: token,
      };
    } else {
      const newUser = await this.storeNewUser(info);
      await Promise.all([
        this.progressesService.createUserProgress({
          userId: newUser._id,
          books: [],
        }),
        this.notificationsService.storeDeviceToken(
          String(newUser._id),
          info.deviceToken,
        ),
      ]);
      const profile = this.usersHelper.mapToUserProfile(newUser);
      const token = this.authService.generateToken({
        userId: newUser._id,
        role: newUser.role,
      });
      return {
        user: profile,
        token: token,
        refreshToken: token,
      };
    }
  }

  public async loginWithGoogle(body: LoginBodyDto): Promise<UserLogin> {
    if (body.access_token) {
      const googleUser = await this.googleService.getUserData(
        body.access_token,
      );
      if (!googleUser.email)
        throw new BadRequestException('Invalid accessToken');
      return this.login(
        {
          facebookId: '',
          appleId: '',
          email: googleUser.email,
          identifier: googleUser.email,
          givenName: googleUser.given_name,
          familyName: googleUser.family_name,
          displayName: googleUser.name,
          avatar: googleUser.picture,
          deviceToken: body.deviceToken,
        },
        Account.Google,
      );
    } else {
      return this.login(
        {
          facebookId: '',
          appleId: '',
          email: body.email,
          identifier: body.email,
          displayName: body.displayName,
          familyName: '',
          givenName: '',
          avatar: body.avatar,
          deviceToken: body.deviceToken,
        },
        Account.Google,
      );
    }
  }

  public async loginWithFacebook(body: LoginBodyDto): Promise<UserLogin> {
    if (!body.access_token.trim())
      throw new BadRequestException('Invalid accessToken');
    const facebookUser = await this.facebookService.getUserData(
      body.access_token,
    );
    if (!facebookUser) throw new BadRequestException('Invalid accessToken');
    else {
      return this.login(
        {
          facebookId: facebookUser.id,
          email: facebookUser.email ? facebookUser.email : '',
          appleId: '',
          identifier: facebookUser.id,
          givenName: facebookUser.first_name,
          familyName: facebookUser.last_name,
          displayName: facebookUser.name,
          avatar: `https://graph.facebook.com/${facebookUser.id}/picture?type=square`,
          deviceToken: body.deviceToken,
        },
        Account.Facebook,
      );
    }
  }

  public async loginWithApple(body: LoginBodyDto): Promise<UserLogin> {
    if (!body.appleId) throw new BadRequestException();
    return this.login(
      {
        facebookId: '',
        email: body.email ? body.email : '',
        appleId: body.appleId,
        identifier: body.appleId,
        displayName: body.displayName ? body.displayName : '',
        familyName: '',
        givenName: '',
        avatar: DEFAULT_AVATAR,
        deviceToken: body.deviceToken,
      },
      Account.Apple,
    );
  }
}
