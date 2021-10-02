import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  CACHE_MANAGER,
  ForbiddenException,
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
import { ConfigsService } from '@configs';
import { MAX_TTL, NAME_REGEX, VIETNAM_TIME_ZONE } from '@utils/constants';
import * as _ from 'lodash';
import { GroupAddressDto, SubAddress } from '@dto/address';
import { LocationRanking } from '@dto/ranking';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { SubLocation } from '@utils/enums';
@Injectable()
export class UsersService {
  private prefixKey: string;
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
    private readonly configsService: ConfigsService,
    private readonly statisticService: ScoreStatisticsService,
  ) {
    this.prefixKey = this.configsService.get('MODE');
  }

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
    if (data.role === Role.Admin) {
      throw new ForbiddenException();
    }
    if (data.displayName.length > 25 || !NAME_REGEX.test(data.displayName)) {
      throw new BadRequestException('displayName is invalid.');
    }
    if (
      data.familyName &&
      (data.familyName.length > 25 || !NAME_REGEX.test(data.familyName))
    ) {
      throw new BadRequestException('familyName is invalid.');
    }
    if (
      data.givenName &&
      (data.givenName.length > 25 || !NAME_REGEX.test(data.givenName))
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
    await this.cache.set<UserProfile>(
      `${this.prefixKey}/profile/${String(userId)}`,
      profile,
      { ttl: 86400 },
    );
    return profile;
  }

  public async saveUserLesson(
    userCtx: JwtPayLoad,
    input: SaveLessonDto,
  ): Promise<string> {
    // const session = await this.transactionService.createSession();
    // session.startTransaction();
    // eslint-disable-next-line prefer-const
    let [userProfile, lessonTree] = await Promise.all([
      this.cache.get<UserProfile | null>(
        `${this.prefixKey}/profile/${String(userCtx.userId)}`,
      ),
      this.booksService.getLessonTree({
        bookId: input.bookId,
        unitId: input.unitId,
        levelIndex: input.levelIndex,
        lessonIndex: input.lessonIndex,
        isOverLevel: false,
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
      // this.leaderBoardsService.updateUserPointDto(
      //   { ...userProfile, _id: userCtx.userId },
      //   point,
      // ),
    ]).catch((error) => {
      console.log(error);
      throw new InternalServerErrorException(error);
    });
    // await session.commitTransaction();
    // session.endSession();
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
    role?: Role,
  ): Promise<UserRank[]> {
    if (displayFollowings) {
      const result = await this.followingsService.getAllTimeFollowingsXp(
        userId,
        role,
      );
      return result;
    }
    let filter = {};
    if (location) {
      switch (location) {
        case Location.Province:
          filter = {
            role: { $ne: Role.Admin },
            'address.province': locationId,
          };
          break;
        case Location.District:
          filter = {
            role: { $ne: Role.Admin },
            'address.district': locationId,
          };
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
    }
    const userRankList = await this.userModel
      .find(filter)
      .sort({ xp: -1 })
      .select({ xp: 1, displayName: 1, avatar: 1 })
      .limit(10)
      .lean();
    const xpArr: UserRank[] = [];
    if (!userRankList) {
      throw new BadRequestException('Can not find users');
    }
    let orderNumber = 1;
    userRankList.forEach((item) => {
      xpArr.push({
        orderNumber: orderNumber,
        displayName: item.displayName,
        avatar: item.avatar,
        userId: item._id,
        xp: item.xp,
        isCurrentUser: false,
      });
      orderNumber++;
    });
    return xpArr;
  }

  public async getAllUsers(): Promise<LeanDocument<UserDocument>[]> {
    return this.userModel
      .find({ xp: { $ne: 0 } })
      .select(['_id'])
      .lean();
  }

  public findUser(userId: string) {
    return from(
      this.cache.get<UserProfile>(`${this.prefixKey}/profile/${userId}`),
    ).pipe(
      switchMap((r) => {
        if (r !== null) return of(r);
        const selectFields = [
          'email',
          'avatar',
          'displayName',
          'role',
          'level',
          'score',
          'streak',
          'lastActive',
          'grade',
          'xp',
          'rank',
          '_id',
          'createdAt',
          'address',
          'enableNotification',
        ];
        return from(
          this.userModel
            .findById(userId)
            .select(selectFields)
            .populate('address.province', ['name', '_id'], Province.name)
            .populate('address.district', ['name', '_id'], District.name)
            .populate('address.school', ['name', '_id'], School.name)
            .lean(),
        ).pipe(
          map((user: any) => {
            if (!user)
              throw new BadRequestException(`Can't find user ${userId}`);
            const userProfile = this.usersHelper.mapToUserProfile(user);
            this.cache
              .set<UserProfile>(
                `${this.prefixKey}/profile/${userId}`,
                userProfile,
                {
                  ttl: 86400,
                },
              )
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

  public async pushToCache() {
    const selectFields = [
      'email',
      'avatar',
      'displayName',
      'role',
      'level',
      'score',
      'streak',
      'lastActive',
      'grade',
      'xp',
      'rank',
      '_id',
      'createdAt',
      'address',
      'enableNotification',
      'ranking',
    ];
    const users = await this.userModel
      .find({ xp: { $ne: 0 } })
      .select(selectFields)
      .populate('address.province', ['name'], Province.name)
      .populate('address.district', ['name'], District.name)
      .populate('address.school', ['name'], School.name)
      .lean();
    await Promise.all(
      users.map((user: any) => {
        const userProfile = this.usersHelper.mapToUserProfile(user);
        return this.cache.set<UserProfile>(
          `${this.prefixKey}/profile/${userProfile.userId}`,
          userProfile,
          { ttl: 86400 },
        );
      }),
    );
  }

  public async groupUsers(byWeek?: boolean) {
    const groupByProvinces = async (boundary: {
      lower: number;
      upper: number;
    }) => {
      const groups: GroupAddressDto[] = await this.userModel.aggregate([
        {
          $match: {
            xp: { $ne: 0 },
            'address.province': { $gte: boundary.lower, $lte: boundary.upper },
          },
        },
        {
          $group: {
            _id: {
              province: '$address.province',
            },
            users: {
              $push: {
                _id: '$_id',
                subAddress: {
                  district: '$address.district',
                  school: '$address.school',
                  grade: '$address.grade',
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            province: '$_id.province',
            users: '$users',
          },
        },
        {
          $limit: boundary.upper - boundary.lower + 1,
        },
      ]);
      return groups;
    };
    const TOTAL_PROVINCES = 63;
    const PROVINCES_PER_FRAGMENT = 10;
    const remainder = TOTAL_PROVINCES % PROVINCES_PER_FRAGMENT;
    const boundaries = this.usersHelper
      .fragments(TOTAL_PROVINCES, PROVINCES_PER_FRAGMENT)
      .map((e, index) => {
        return e !== PROVINCES_PER_FRAGMENT
          ? { lower: index * e + 1, upper: (index + 1) * e }
          : {
              lower: index * e + remainder + 1,
              upper: (index + 1) * e + remainder,
            };
      });
    const result: GroupAddressDto[] = (
      await Promise.all(boundaries.map((element) => groupByProvinces(element)))
    ).flat();
    const locationRankings: LocationRanking[] = await Promise.all(
      result.map((element) => this.xpStatistic(element, byWeek)),
    );
    const findProfileWithRanking = async (ranking: {
      _id: string;
      totalXp: number;
      order: number;
    }) => {
      const selectFields = ['_id', 'role', 'avatar', 'displayName', 'address'];
      const user = await this.userModel
        .findById(Types.ObjectId(ranking._id))
        .select(selectFields)
        .lean();
      if (user) {
        return {
          orderNumber: ranking.order,
          displayName: user.displayName,
          avatar: user.avatar,
          userId: String(user._id),
          xp: ranking.totalXp,
          isCurrentUser: false,
          role: user.role,
        };
      }
    };
    const updateNationwideRanking = async () => {
      const allRankings = locationRankings
        .map((item) => item.rankings)
        .flat()
        .sort(function (a, b) {
          return b.totalXp - a.totalXp;
        });
      if (allRankings?.length > 0) {
        const nationwideField = byWeek
          ? 'ranking.nationwide.weeklyOrder'
          : 'ranking.nationwide.monthlyOrder';
        const xpFiled = byWeek ? 'ranking.weeklyXp' : 'ranking.monthlyXp';
        await Promise.all(
          allRankings.map((element, index) => {
            return this.userModel.updateOne(
              {
                _id: Types.ObjectId(String(element._id)),
              },
              {
                $set: {
                  [nationwideField]: index + 1,
                  [xpFiled]: Number(element.totalXp),
                },
              },
            );
          }),
        );
        const highestScorersNationwide = allRankings.slice(0, 10);
        const nationwideRanking = await Promise.all(
          highestScorersNationwide.map((element, index) => {
            return findProfileWithRanking({
              _id: element._id,
              totalXp: element.totalXp,
              order: index + 1,
            });
          }),
        );
        const timePath = byWeek ? 'weekly' : 'monthly';
        const locationPath = 'nationwide';
        const pathCached = `${this.prefixKey}/ranking/${timePath}/${locationPath}`;
        await this.cache.set<
          {
            orderNumber: number;
            displayName: string;
            avatar: string;
            userId: string;
            xp: number;
            isCurrentUser: boolean;
            role: Role;
          }[]
        >(pathCached, nationwideRanking, { ttl: MAX_TTL });
      }
    };
    const updateProvinceRanking = async () => {
      const exec = async (locationRanking: LocationRanking) => {
        const rankings = locationRanking.rankings;
        if (rankings?.length > 0) {
          const ranking$province = byWeek
            ? 'ranking.province.weeklyOrder'
            : 'ranking.province.monthlyOrder';
          await Promise.all(
            rankings.map((element, index) => {
              return this.userModel.updateOne(
                {
                  _id: Types.ObjectId(element._id),
                },
                {
                  $set: {
                    [ranking$province]: index + 1,
                  },
                },
                {
                  new: true,
                },
              );
            }),
          );
          const highestScorersProvince = rankings?.slice(0, 10);
          if (highestScorersProvince?.length > 0) {
            const provinceRanking = await Promise.all(
              highestScorersProvince.map((element, index) => {
                return findProfileWithRanking({
                  _id: element._id,
                  totalXp: element.totalXp,
                  order: index + 1,
                });
              }),
            );
            const timePath = byWeek ? 'weekly' : 'monthly';
            const locationPath = `province/${locationRanking.province}`;
            const pathCached = `${this.prefixKey}/ranking/${timePath}/${locationPath}`;
            await this.cache.set<
              {
                orderNumber: number;
                displayName: string;
                avatar: string;
                userId: string;
                xp: number;
                isCurrentUser: boolean;
                role: Role;
              }[]
            >(pathCached, provinceRanking, { ttl: MAX_TTL });
          }
        }
      };
      return Promise.all(locationRankings.map((element) => exec(element)));
    };
    const updateSubLocationRanking = async () => {
      const groups = (locationRanking: LocationRanking) => {
        const districts = _.groupBy(
          locationRanking.rankings.filter(
            (item) => item.subAddress.district > 0,
          ),
          (item) => item.subAddress.district,
        );
        const schools = _.groupBy(
          locationRanking.rankings.filter(
            (item) => item.subAddress?.school > 0,
          ),
          (item) => item.subAddress.school,
        );
        const grades = _.groupBy(
          locationRanking.rankings.filter((item) => item.subAddress?.grade > 0),
          (item) => `${item.subAddress.school}-${item.subAddress.grade}`,
        );
        return { districts, schools, grades };
      };
      (async () => {
        const timeField = byWeek ? 'weeklyOrder' : 'monthlyOrder';
        await Promise.all(
          locationRankings.map((locationRanking) => {
            const rankings = locationRanking?.rankings;
            if (rankings?.length > 0) {
              const { districts, schools, grades } = groups(locationRanking);
              const listRankingLocation = rankings.map((element) => {
                const ranking$locations: {
                  [key: string]: unknown;
                  userId: string;
                } = { userId: element._id };
                const findIn$Location = (
                  key: string,
                  subLocation: SubLocation,
                  list: _.Dictionary<
                    [
                      { _id: string; totalXp: number; subAddress: SubAddress },
                      ...{
                        _id: string;
                        totalXp: number;
                        subAddress: SubAddress;
                      }[]
                    ]
                  >,
                ) => {
                  const rankings = list[key];
                  let index = rankings?.findIndex(
                    (item) => String(item._id) === String(element._id),
                  );
                  index != null && index != undefined
                    ? (index += 1)
                    : (index = 0);
                  ranking$locations[subLocation] = {
                    [timeField]: index,
                  };
                };
                findIn$Location(
                  String(element.subAddress.district),
                  SubLocation.District,
                  districts,
                );
                findIn$Location(
                  String(element.subAddress.school),
                  SubLocation.School,
                  schools,
                );
                findIn$Location(
                  `${element.subAddress.school}-${element.subAddress.grade}`,
                  SubLocation.Grade,
                  grades,
                );
                return ranking$locations;
              });
              return Promise.all(
                listRankingLocation.map((element) => {
                  const object = {
                    [`ranking.district.${timeField}`]:
                      element['district'][timeField],
                    [`ranking.school.${timeField}`]:
                      element['school'][timeField],
                    [`ranking.grade.${timeField}`]: element['grade'][timeField],
                  };
                  return this.userModel.updateOne(
                    {
                      _id: Types.ObjectId(element.userId),
                    },
                    {
                      $set: {
                        ...object,
                      },
                    },
                  );
                }),
              );
            }
          }),
        );
        const updateSubAddressRankingCache = async (
          listSubLocationRaking: _.Dictionary<
            [
              {
                _id: string;
                totalXp: number;
                subAddress: SubAddress;
              },
              ...{
                _id: string;
                totalXp: number;
                subAddress: SubAddress;
              }[]
            ]
          >,
          subLocation: SubLocation,
        ) => {
          const listSubLocations = Object.keys(listSubLocationRaking);
          if (listSubLocations?.length > 0) {
            const exec = async (key: string) => {
              const rankings = listSubLocationRaking[key];
              if (rankings?.length > 0) {
                const higherScoreUsers = rankings.slice(0, 10);
                const subLocationRanking = await Promise.all(
                  higherScoreUsers.map((element, index) => {
                    return findProfileWithRanking({
                      _id: element._id,
                      totalXp: element.totalXp,
                      order: index + 1,
                    });
                  }),
                );
                const timePath = byWeek ? 'weekly' : 'monthly';
                const locationPath = subLocation;
                const pathCached = `${this.prefixKey}/ranking/${timePath}/${locationPath}/${key}`;
                await this.cache.set<
                  {
                    orderNumber: number;
                    displayName: string;
                    avatar: string;
                    userId: string;
                    xp: number;
                    isCurrentUser: boolean;
                    role: Role;
                  }[]
                >(pathCached, subLocationRanking, { ttl: MAX_TTL });
              }
            };
            await Promise.all(
              listSubLocations.map((element) => {
                return exec(element);
              }),
            );
          }
        };
        await Promise.all(
          locationRankings.map((locationRanking) => {
            const rankings = locationRanking?.rankings;
            if (rankings?.length > 0) {
              const { districts, schools, grades } = groups(locationRanking);
              return Promise.all([
                updateSubAddressRankingCache(districts, SubLocation.District),
                updateSubAddressRankingCache(schools, SubLocation.School),
                updateSubAddressRankingCache(grades, SubLocation.Grade),
              ]);
            }
          }),
        );
      })();
    };
    await updateNationwideRanking();
    await updateProvinceRanking();
    await updateSubLocationRanking();
    console.log('Done__________________________________');
  }

  public async xpStatistic(group: GroupAddressDto, byWeek?: boolean) {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const length = group?.users?.length;
    let LIMIT = 10;
    if (length <= 15) LIMIT = 6;
    else if (length < 20) LIMIT = 8;
    let startTime: Date;
    let endTime: Date;
    if (group?.users?.length > 0) {
      if (byWeek === true) {
        const today = dayjs().tz(VIETNAM_TIME_ZONE).day();
        if (today === 0) {
          startTime = dayjs()
            .tz(VIETNAM_TIME_ZONE)
            .startOf('week')
            .subtract(1, 'week')
            .toDate();
          endTime = dayjs()
            .tz(VIETNAM_TIME_ZONE)
            .endOf('week')
            .subtract(1, 'week')
            .toDate();
        } else {
          startTime = dayjs().tz(VIETNAM_TIME_ZONE).startOf('week').toDate();
          endTime = dayjs().tz(VIETNAM_TIME_ZONE).toDate();
        }
      } else {
        const today = dayjs().tz(VIETNAM_TIME_ZONE).date();
        if (today === 1) {
          startTime = dayjs()
            .tz(VIETNAM_TIME_ZONE)
            .startOf('month')
            .subtract(1, 'month')
            .toDate();
          endTime = dayjs()
            .tz(VIETNAM_TIME_ZONE)
            .endOf('month')
            .subtract(1, 'month')
            .toDate();
        } else {
          startTime = dayjs().tz(VIETNAM_TIME_ZONE).startOf('month').toDate();
          endTime = dayjs().tz(VIETNAM_TIME_ZONE).toDate();
        }
      }
      const remainder = group.users.length % LIMIT;
      const boundaries = this.usersHelper
        .fragments(group.users.length, LIMIT)
        .map((e, index) => {
          const offset = e !== LIMIT ? 0 : remainder;
          const start = index * e + offset;
          const end = (index + 1) * e + offset;
          return group.users.slice(start, end).map((element) => element._id);
        });
      const ranking = (
        await Promise.all(
          boundaries.map((element) => {
            return this.scoreStatisticsService.totalXpWithFilter({
              createdAt: {
                $gte: startTime,
                $lte: endTime,
              },
              user: { $in: element },
            });
          }),
        )
      )
        .flat()
        .sort(function (a, b) {
          return b.totalXp - a.totalXp;
        });
      const result = [];
      ranking.forEach((element) => {
        const user = group.users.find(
          (item) => String(item._id) == String(element._id),
        );
        if (user) {
          result.push({ ...element, subAddress: user.subAddress });
        }
      });
      return { province: group.province, rankings: result };
    }
  }
}
