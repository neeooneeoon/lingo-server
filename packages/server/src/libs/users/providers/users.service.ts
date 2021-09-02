import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  CACHE_MANAGER,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model, Types, UpdateWriteOpResult } from 'mongoose';
import { User, UserDocument } from '@entities/user.entity';
import { ProgressesService } from '@libs/progresses/progresses.service';
import { UsersHelper } from '@helpers/users.helper';
import { Location, Role } from '@utils/enums';
import {
  SaveLessonDto,
  SearchUser,
  UpdateUserDto,
  UserProfile,
} from '@dto/user';
import { JwtPayLoad } from '@utils/types';
import { AnswerResult } from '@dto/lesson';
import { WorkInfo } from '@dto/works';
import { LeaderBoardsService } from '@libs/leaderBoards/leaderBoards.service';
import { BooksService } from '@libs/books/providers/books.service';
import { WorksService } from '@libs/works/works.service';
import { FollowingsService } from '@libs/followings/providers/followings.service';
import { UserRank } from '@dto/leaderBoard/userRank.dto';
import { ScoreStatisticsService } from '@libs/scoreStatistics/scoreStatistics.service';
import { forkJoin, from, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ScoreOverviewDto } from '@dto/progress';
import { NotificationsService } from '@libs/notifications/providers/notifications.service';
import { Province } from '@entities/province.entity';
import { District } from '@entities/district.entity';
import { Cache } from 'cache-manager';
import { TransactionService } from '@connect';
import { UserScoresService } from '@libs/users/providers/userScores.service';
import { School } from '@entities/school.entity';
import emojiRegex from 'emoji-regex/RGI_Emoji';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly usersHelper: UsersHelper,
    private progressesService: ProgressesService,
    private booksService: BooksService,
    private worksService: WorksService,
    @Inject(forwardRef(() => LeaderBoardsService))
    private leaderBoardsService: LeaderBoardsService,
    @Inject(forwardRef(() => ScoreStatisticsService))
    private scoreStatisticsService: ScoreStatisticsService,
    private followingsService: FollowingsService,
    private readonly notificationsService: NotificationsService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private transactionService: TransactionService,
    private usersScoreService: UserScoresService,
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

  public async findById(userId: string): Promise<LeanDocument<UserDocument>> {
    try {
      return this.userModel.findById(Types.ObjectId(userId)).lean();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async findAll(): Promise<LeanDocument<UserDocument>[]> {
    try {
      return this.userModel
        .find({})
        .select(['_id', 'xp', 'displayName'])
        .lean();
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
    const nameRegex =
      /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/g;
    if (data.displayName.length > 25 || !nameRegex.test(data.displayName)) {
      throw new BadRequestException('displayName is invalid.');
    }
    if (
      data.familyName &&
      (data.familyName.length > 25 || !nameRegex.test(data.familyName))
    ) {
      throw new BadRequestException('familyName is invalid.');
    }
    if (
      data.givenName &&
      (data.givenName.length > 25 || !nameRegex.test(data.givenName))
    ) {
      throw new BadRequestException('givenName is invalid.');
    }
    if (!Number.isInteger(data.grade) && (data.grade <= 0 || data.grade > 12))
      throw new BadRequestException('Grade invalid');
    const address = {
      address: {
        province: data.provinceId,
        district: data.districtId,
        school: data.schoolId,
        grade: data.grade,
      },
    };
    delete data.provinceId;
    delete data.districtId;
    delete data.schoolId;
    delete data.grade;
    const userData = { ...data, ...address };
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { ...userData }, { new: true })
      .populate('address.province', ['name'], Province.name)
      .populate('address.district', ['name'], District.name)
      .populate('address.school', ['name'], School.name);
    const profile = this.usersHelper.mapToUserProfile(updatedUser);
    await this.cache.set<UserProfile>(`profile/${String(userId)}`, profile);
    return profile;
  }

  public async saveUserLesson(
    userCtx: JwtPayLoad,
    input: SaveLessonDto,
  ): Promise<string> {
    // eslint-disable-next-line prefer-const
    let [userProfile, lessonTree] = await Promise.all([
      this.cache.get<UserProfile | null>(`profile/${String(userCtx.userId)}`),
      this.booksService.getLessonTree({
        bookId: input.bookId,
        unitId: input.unitId,
        levelIndex: input.levelIndex,
        lessonIndex: input.lessonIndex,
      }),
    ]);
    if (!lessonTree) {
      throw new NotFoundException(`Can't find lessonTree with ${input}`);
    }
    if (!userProfile) {
      userProfile = await this.findUser(userCtx.userId).toPromise();
    }
    const lessonResult: AnswerResult[] = input.results.map((result) => ({
      ...result,
      status: false,
    }));
    const { doneQuestions, timeEnd, timeStart } = input;
    const userWork: WorkInfo = {
      doneQuestions: doneQuestions,
      timeStart: new Date(timeStart),
      timeEnd: new Date(timeEnd),
    };
    const [isPassedLevel, point] = await Promise.all([
      this.progressesService.saveUserProgress(
        userCtx.userId,
        lessonTree,
        userWork,
      ),
      this.worksService.saveUserWork(
        { ...userProfile, _id: userCtx.userId },
        lessonTree,
        userWork,
        lessonResult,
      ),
    ]);
    await Promise.all([
      this.scoreStatisticsService.addXpAfterSaveLesson(point, userCtx.userId),
      this.usersScoreService.updateUserStatus({
        user: { ...userProfile, _id: userCtx.userId },
        workInfo: userWork,
        isFinishLevel: isPassedLevel,
        point: point,
      }),
      this.leaderBoardsService.updateUserPointDto(
        { ...userProfile, _id: userCtx.userId },
        point,
      ),
    ]).catch((error) => {
      throw new InternalServerErrorException(error);
    });
    return 'save user work';
  }

  public searchUser(
    search: string,
    userId: string,
    pageNumber: number,
  ): Observable<SearchUser[]> {
    search = search.trim();
    const limit = 15;
    const selectFields = ['_id', 'email', 'avatar', 'displayName'];
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
        .select(selectFields)
        .lean()
        .skip(skip)
        .limit(limit),
    ]).pipe(
      map(([allFollowings, users]) => {
        const followUsers = allFollowings.map((item) =>
          String(item.followUser),
        );
        return this.usersHelper.mapToFollowingResult(followUsers, users);
      }),
    );
  }

  public async getAllTimeUserXpList(
    displayFollowings: boolean,
    userId: string,
    location: string,
    locationId?: number,
    schoolId?: number,
  ): Promise<UserRank[]> {
    if (displayFollowings) {
      const result = await this.followingsService.getAllTimeFollowingsXp(
        userId,
      );
      return result;
    }
    let filter = {};
    switch (location) {
      case Location.Province:
        filter = { role: { $ne: Role.Admin }, 'address.province': locationId };
        break;
      case Location.District:
        filter = { role: { $ne: Role.Admin }, 'address.district': locationId };
        break;
      case Location.School:
        filter = { role: { $ne: Role.Admin }, 'address.school': locationId };
        break;
      case Location.Grade:
        filter = {
          role: { $ne: Role.Admin },
          'address.grade': locationId,
          'address.school': schoolId,
        };
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
        orderNumber: 0,
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

  public findUser(userId: string) {
    return from(this.cache.get<UserProfile>(`profile/${userId}`)).pipe(
      switchMap((r) => {
        const cachedUser = r;
        if (cachedUser !== null) return of(cachedUser);
        return from(
          this.userModel
            .findById(userId)
            .populate('address.province', ['name'], Province.name)
            .populate('address.district', ['name'], District.name)
            .populate('address.school', ['name'], School.name),
        ).pipe(
          map((user) => {
            if (!user)
              throw new BadRequestException(`Can't find user ${userId}`);
            const userProfile = this.usersHelper.mapToUserProfile(user);
            this.cache
              .set<UserProfile>(`profile/${userId}`, userProfile, {
                ttl: 7200,
              })
              .then((r) => r)
              .catch((e) => {
                throw e;
              });
            return userProfile;
          }),
        );
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
    schoolId?: number,
  ): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) return false;
    switch (location) {
      case Location.Province:
        return user.address.province === locationId;
      case Location.District:
        return user.address.district === locationId;
      case Location.School:
        return user.address.school === locationId;
      case Location.Grade:
        return (
          user.address.grade === locationId && user.address.school === schoolId
        );
    }
    return true;
  }

  public logout(currentUser: string) {
    return this.notificationsService.removeDeviceToken(currentUser);
  }
  public async updateXp(xp: number, userId: string): Promise<void> {
    try {
      await this.userModel.findOneAndUpdate(
        { _id: new Types.ObjectId(userId) },
        { $inc: { xp: xp } },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  public async renewAllUsers() {
    const backups = await this.userModel.find();
    await this.userModel.deleteMany();
    await this.userModel.insertMany(backups);
  }

  public async resetUsername() {
    const users = await this.userModel.find().lean();
    const regex = emojiRegex();
    const DEFAULT_USERNAME = 'username';

    for (const user of users) {
      const { displayName, givenName, familyName, email } = user;
      if (regex.test(displayName)) {
        let replaceName = DEFAULT_USERNAME;
        if (familyName || givenName) {
          replaceName = `${givenName} ${familyName}`.trim();
        } else if (email) {
          const index = email.indexOf('@');
          if (index !== -1) {
            replaceName = email.slice(0, index).slice(0, 25);
          }
        }
        await this.userModel.updateOne(
          {
            _id: Types.ObjectId(user._id),
          },
          {
            displayName: replaceName,
          },
        );
      } else if (user.displayName.length > 25) {
        let replaceName = DEFAULT_USERNAME;
        if (familyName || givenName) {
          replaceName = `${givenName} ${familyName}`.trim();
        } else if (email) {
          const index = email.indexOf('@');
          if (index !== -1) {
            replaceName = email.slice(0, index).slice(0, 25);
          }
        } else {
          replaceName = displayName.slice(0, 25);
        }
        await this.userModel.updateOne(
          {
            _id: Types.ObjectId(user._id),
          },
          {
            displayName: replaceName,
          },
        );
      }
    }
  }
}
