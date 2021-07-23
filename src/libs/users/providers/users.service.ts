import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateWriteOpResult } from 'mongoose';
import { User, UserDocument } from '@entities/user.entity';
import { AuthenticationService } from '@authentication/authentication.service';
import { GoogleService } from './google.service';
import { ProgressesService } from '@libs/progresses/progresses.service';
import { UsersHelper } from '@helpers/users.helper';
import { Rank, Role } from '@utils/enums';
import {
  FetchAccountInfo,
  LoginBodyDto,
  SaveLessonDto,
  SearchUser,
  UpdateUserDto,
  UpdateUserStatusDto,
  UserLogin,
  UserProfile,
} from '@dto/user';
import { FacebookService } from './facebook.service';
import { JwtPayLoad } from '@utils/types';
import { AnswerResult } from '@dto/lesson';
import { WorkInfo } from '@dto/works';
import { LeaderBoardsService } from '@libs/leaderBoards/leaderBoards.service';
import { BooksService } from '@libs/books/providers/books.service';
import { WorksService } from '@libs/works/works.service';
import { FollowingsService } from '@libs/followings/providers/followings.service';
import { UserRank } from '@dto/leaderBoard/userRank.dto';
import { ScoreStatisticsService } from '@libs/scoreStatistics/scoreStatistics.service';
import { forkJoin, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ScoreOverviewDto } from '@dto/progress';
import { FollowingDocument } from '@entities/following.entity';
import { NotificationsService } from '@libs/notifications/providers/notifications.service';
import { Province } from '@entities/province.entity';
import { District } from '@entities/district.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly usersHelper: UsersHelper,
    private authService: AuthenticationService,
    private googleService: GoogleService,
    private facebookService: FacebookService,
    private progressesService: ProgressesService,
    private booksService: BooksService,
    private worksService: WorksService,
    @Inject(forwardRef(() => LeaderBoardsService))
    private leaderBoardsService: LeaderBoardsService,
    @Inject(forwardRef(() => ScoreStatisticsService))
    private scoreStatisticsService: ScoreStatisticsService,
    private followingsService: FollowingsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  public async findByIds(
    ids: Types.ObjectId[] | string[],
  ): Promise<UserDocument[]> {
    try {
      return this.userModel.find({
        _id: {
          $in: ids,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async getUserProfile(
    fetchAccount: FetchAccountInfo,
  ): Promise<UserLogin> {
    const { email } = fetchAccount;

    const existsUser = await this.userModel.findOne({
      email: email,
    });
    if (existsUser) {
      this.notificationsService
        .saveDeviceToken(String(existsUser._id), fetchAccount.deviceToken)
        .pipe()
        .subscribe();
      const useProfile = this.usersHelper.mapToUserProfile(existsUser);
      const token = this.authService.generateToken({
        userId: existsUser._id,
        role: existsUser.role,
      });
      return {
        user: useProfile,
        token: token,
        refreshToken: token,
      };
    } else {
      const newUser = await this.userModel.create({
        ...fetchAccount,
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
      await Promise.all([
        this.progressesService.createUserProgress({
          userId: newUser._id,
          books: [],
        }),
        this.notificationsService.saveDeviceToken(
          String(newUser._id),
          fetchAccount.deviceToken,
        ),
      ]);
      const userProfile = this.usersHelper.mapToUserProfile(newUser);
      const token = this.authService.generateToken({
        userId: newUser._id,
        role: newUser.role,
      });
      return {
        user: userProfile,
        token: token,
        refreshToken: token,
      };
    }
  }

  public async googleLoginHandle(body: LoginBodyDto): Promise<UserLogin> {
    try {
      if (body.access_token) {
        const {
          email,
          picture: avatar,
          given_name: givenName,
          family_name: familyName,
          name: displayName,
        } = await this.googleService.getUserData(body.access_token);

        if (!email) {
          throw new BadRequestException('Invalid accessToken');
        } else {
          return this.getUserProfile({
            facebookId: '-1',
            email: email,
            givenName: givenName,
            familyName: familyName,
            displayName: displayName,
            avatar: avatar,
            deviceToken: body.deviceToken,
          });
        }
      } else {
        return this.getUserProfile({
          displayName: body.displayName,
          facebookId: '-1',
          familyName: '',
          givenName: '',
          avatar: body.avatar,
          email: body.email,
          deviceToken: body.deviceToken,
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async facebookLoginHandle(body: LoginBodyDto): Promise<UserLogin> {
    const facebookProfile = await this.facebookService.getUserData(
      body.access_token,
    );

    if (!facebookProfile) {
      throw new BadRequestException('This account not exists.');
    } else {
      return this.getUserProfile({
        facebookId: facebookProfile.id,
        email: facebookProfile.email,
        givenName: facebookProfile.first_name,
        familyName: facebookProfile.last_name,
        displayName: facebookProfile.name,
        avatar: `http://graph.facebook.com/${facebookProfile.id}/picture?type=square`,
        deviceToken: body.deviceToken,
      });
    }
  }

  public async queryMe(userId: Types.ObjectId | string): Promise<UserProfile> {
    try {
      const user = await this.userModel.findById(userId);
      if (user) {
        return this.usersHelper.mapToUserProfile(user);
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  public async updateUserProfile(
    userId: Types.ObjectId | string,
    data: UpdateUserDto,
  ): Promise<UserProfile> {
    try {
      const address = {
        address: {
          province: data.provinceId,
          district: data.districtId,
        },
      };
      delete data.provinceId;
      delete data.districtId;
      const userData = { ...data, ...address };
      const updatedUser = await this.userModel
        .findByIdAndUpdate(userId, { ...userData }, { new: true })
        .populate('address.province', ['name'], Province.name)
        .populate('address.district', ['name'], District.name);
      // .populate('address.district', ['name']);
      return this.usersHelper.mapToUserProfile(updatedUser);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserStatus(input: UpdateUserStatusDto): Promise<void> {
    try {
      const { user, workInfo, isFinishLevel, point } = input;

      let streak = user.streak;
      let loginCount = user.loginCount;
      const xp = user.xp;

      const newActive = workInfo.timeStart;
      const lastActive = user.lastActive;

      const newActiveDay = Number(newActive.toLocaleDateString().split('/')[1]);
      const lastActiveDay = Number(
        lastActive.toLocaleDateString().split('/')[1],
      );
      const checker = newActiveDay - lastActiveDay;

      if (checker === 1) {
        streak++;
        loginCount++;
      } else if (checker > 1) {
        streak = 0;
        loginCount++;
      } else if (checker === 0) {
        if (streak === 0 && loginCount === 0) {
          streak++;
          loginCount++;
        }
      }

      if (isFinishLevel) {
        await this.userModel.updateOne(
          { _id: user._id },
          {
            streak: streak,
            lastActive: workInfo.timeStart,
            loginCount: loginCount,
            level: user.level + 1,
            score: user.score + 1,
            xp: xp + point,
          },
        );
      } else {
        await this.userModel.updateOne(
          { _id: user._id },
          {
            streak: streak,
            lastActive: workInfo.timeStart,
            loginCount: loginCount,
            score: user.score + 1,
            xp: xp + point,
          },
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async saveUserLesson(
    userCtx: JwtPayLoad,
    input: SaveLessonDto,
  ): Promise<string> {
    const userProfile = await this.userModel.findById(userCtx.userId);
    if (!userProfile) {
      throw new UnauthorizedException('Not authorized');
    }
    const lessonResult: AnswerResult[] = input.results.map((result) => ({
      ...result,
      status: false,
    }));
    const {
      doneQuestions,
      timeEnd,
      timeStart,
      bookId,
      unitId,
      levelIndex,
      lessonIndex,
    } = input;
    const userWork: WorkInfo = {
      doneQuestions: doneQuestions,
      timeStart: new Date(timeStart),
      timeEnd: new Date(timeEnd),
    };

    const lessonTree = await this.booksService.getLessonTree({
      bookId: bookId,
      unitId: unitId,
      levelIndex: levelIndex,
      lessonIndex: lessonIndex,
    });
    if (!lessonTree) {
      throw new NotFoundException(`Can't find lessonTree with ${input}`);
    }
    const saveUserProgressPromise = this.progressesService.saveUserProgress(
      userCtx.userId,
      lessonTree,
      userWork,
    );
    const saveUserWorkPromise = this.worksService.saveUserWork(
      userProfile,
      lessonTree,
      userWork,
      lessonResult,
    );

    let isPassedLevel = false;
    let point = 0;
    await Promise.all([saveUserProgressPromise, saveUserWorkPromise])
      .then(([promiseOneResult, promiseTwoResult]) => {
        isPassedLevel = promiseOneResult;
        point = promiseTwoResult;
      })
      .catch((error) => {
        throw new InternalServerErrorException(error);
      });
    await this.scoreStatisticsService.addXpAfterSaveLesson(
      point,
      userCtx.userId,
    );
    const updateUserStatusPromise = this.updateUserStatus({
      user: userProfile,
      workInfo: userWork,
      isFinishLevel: isPassedLevel,
      point: point,
    });
    const updateUserPointPromise = this.leaderBoardsService.updateUserPointDto(
      userProfile,
      point,
    );
    await Promise.all([updateUserStatusPromise, updateUserPointPromise]).catch(
      (error) => {
        throw new InternalServerErrorException(error);
      },
    );
    return 'save user work';
  }

  public searchUser(
    search: string,
    userId: string,
    pageNumber: number,
  ): Observable<SearchUser[]> {
    search = search.trim();
    const limit = 15;
    const skip = pageNumber < 0 ? 0 : limit * pageNumber;
    if (!search) {
      throw new BadRequestException('Name or email can not be blank');
    }
    return forkJoin([
      this.followingsService.allFollowings(userId),
      this.userModel
        .find({
          $or: [
            { displayName: { $regex: '.*' + search + '.*' } },
            { email: { $regex: '.*' + search + '.*' } },
          ],
          _id: {
            $ne: userId,
          },
          role: {
            $ne: Role.Admin,
          },
        })
        .skip(skip)
        .limit(limit),
    ]).pipe(
      map(([allFollowings, users]: [FollowingDocument[], UserDocument[]]) => {
        const followUsers = allFollowings.map((item) =>
          String(item.followUser),
        );
        return this.usersHelper.mapToFollowingResult(followUsers, users);
      }),
    );
  }

  public async getAllTimeUserXpList(): Promise<UserRank[]> {
    const userRankList = await this.userModel
      .find({ role: { $ne: Role.Admin } })
      .sort({ xp: -1 })
      .select({ xp: 1, displayName: 1, avatar: 1 });
    const xpArr: UserRank[] = [];
    if (!userRankList) {
      throw new BadRequestException('Can not find users');
    }
    for (let i = 0; i < userRankList.length; i++) {
      const item = userRankList[i];
      xpArr.push({
        orderNumber: i + 1,
        displayName: item.displayName,
        avatar: item.avatar,
        userId: item._id,
        xp: item.xp,
        isCurrentUser: false,
      });
    }
    return xpArr;
  }

  public async getAllUsers(): Promise<UserDocument[]> {
    return this.userModel.find({});
  }

  public findUser(userId: string): Observable<UserProfile> {
    return from(
      this.userModel
        .findById(userId)
        .populate('address.province', ['name'], Province.name)
        .populate('address.district', ['name'], District.name),
    ).pipe(
      map((user) => {
        if (!user) {
          throw new BadRequestException(`Can't find user ${userId}`);
        }
        return this.usersHelper.mapToUserProfile(user);
      }),
    );
  }

  public async changeUserStreak(userId: string): Promise<UpdateWriteOpResult> {
    const [user, scoreRecords] = await Promise.all([
      this.userModel.findById(Types.ObjectId(userId)),
      this.scoreStatisticsService.findScoreStatisticRecords(userId),
    ]);
    return this.userModel.updateOne(
      {
        _id: Types.ObjectId(userId),
      },
      {
        $set: {
          streak: scoreRecords.length === 0 ? 0 : user.streak + 1,
        },
      },
    );
  }

  public scoresOverview(userId: string): Observable<ScoreOverviewDto> {
    return forkJoin([
      this.findUser(userId),
      this.progressesService.getAllUserScoresInProgress(userId),
    ]).pipe(
      map(([profile, allScore]) => {
        return {
          ...allScore,
          xp: profile.xp,
          streak: profile.streak,
        };
      }),
    );
  }

  public toggleReceiveNotification(
    currentUser: string,
    enable: boolean,
  ): Observable<boolean> {
    return from(
      this.userModel.updateOne(
        {
          _id: Types.ObjectId(currentUser),
        },
        {
          $set: {
            enableNotification: enable,
          },
        },
      ),
    ).pipe(
      map((updateResult) => {
        if (updateResult.nModified === 1) return true;
        throw new BadRequestException('Failed.');
      }),
    );
  }

  public logout(currentUser: string) {
    return this.notificationsService.removeDeviceToken(currentUser);
  }
}
