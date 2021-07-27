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
import { Location, Role } from '@utils/enums';
import {
  SaveLessonDto,
  SearchUser,
  UpdateUserDto,
  UpdateUserStatusDto,
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

  public async getAllTimeUserXpList(
    location: string,
    locationId?: number,
  ): Promise<UserRank[]> {
    let filter = {};
    switch (location) {
      case Location.Province:
        filter = { role: { $ne: Role.Admin }, 'address.province': locationId };
        break;
      case Location.District:
        filter = { role: { $ne: Role.Admin }, 'address.district': locationId };
        break;
      case Location.All:
      default:
        filter = { role: { $ne: Role.Admin } };
        break;
    }
    const userRankList = await this.userModel
      .find(filter)
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

  public async isUserInLocation(
    userId: string,
    location: string,
    locationId: number,
  ): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) return false;
    switch (location) {
      case Location.Province:
        return user.address.province === locationId;
      case Location.District:
        return user.address.district === locationId;
    }
    return true;
  }

  public logout(currentUser: string) {
    return this.notificationsService.removeDeviceToken(currentUser);
  }
}
