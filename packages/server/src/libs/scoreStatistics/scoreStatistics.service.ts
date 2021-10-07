import { Statistic } from '@dto/leaderBoard/statistic.dto';
import { UserRank } from '@dto/leaderBoard/userRank.dto';
import {
  ScoreStatistic,
  ScoreStatisticDocument,
} from '@entities/scoreStatistic.entity';
import { UserDocument } from '@entities/user.entity';
import { ScoreStatisticsHelper } from '@helpers/scoreStatistics.helper';
import { UsersService } from '@libs/users/providers/users.service';
import {
  BadRequestException,
  CACHE_MANAGER,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { MAX_TTL, VIETNAM_TIME_ZONE } from '@utils/constants';
import { LeanDocument, Model, Types } from 'mongoose';
import { Location, Role } from '@utils/enums';
import { CreateRecordDto } from '@dto/leaderBoard/createRecord.dto';
import { FollowingsService } from '@libs/followings/providers/followings.service';
import { Cache } from 'cache-manager';
import { ConfigsService } from '@configs';

@Injectable()
export class ScoreStatisticsService {
  private readonly prefixKey: string;
  constructor(
    @InjectModel(ScoreStatistic.name)
    private scoreStatisticModel: Model<ScoreStatisticDocument>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private scoreStatisticsHelper: ScoreStatisticsHelper,
    private followingsService: FollowingsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configsService: ConfigsService,
  ) {
    this.prefixKey = this.configsService.get('MODE');
  }

  public async getRankByTime(
    userId: string,
    timeSelect: string,
    displayFollowings: boolean,
    location?: string,
    locationId?: number,
    schoolId?: number,
    role?: Role,
  ): Promise<UserRank[]> {
    timeSelect = timeSelect.trim();
    dayjs.extend(utc);
    dayjs.extend(timezone);
    if (!timeSelect) {
      throw new BadRequestException('timeSelect not entered');
    }
    let startTime: Date;
    let xpArr: UserRank[] = [];
    switch (timeSelect) {
      case 'week':
        startTime = dayjs().tz(VIETNAM_TIME_ZONE).startOf('week').toDate();
        break;
      case 'month':
        startTime = dayjs().tz(VIETNAM_TIME_ZONE).startOf('month').toDate();
        break;
      case 'all':
        xpArr = await this.usersService.getAllTimeUserXpList(
          displayFollowings,
          userId,
          location,
          locationId,
          schoolId,
          role,
        );
        break;
      default:
        break;
    }
    const endTime = dayjs().toDate();
    if (timeSelect != 'all') {
      const filter = {
        createdAt: {
          $gte: startTime,
          $lte: endTime,
        },
      };
      xpArr = await this.getTotalXp(
        displayFollowings,
        filter,
        locationId,
        location,
        schoolId,
        userId,
        role,
      );
    }
    return xpArr;
  }

  public async getRankingByTimeAndLocation(
    userId: string,
    timeSelect: string,
    displayFollowings: boolean,
    location?: string,
    locationId?: number,
    schoolId?: number,
    _role?: Role,
  ) {
    timeSelect = timeSelect?.trim()?.toLowerCase();
    dayjs.extend(utc);
    dayjs.extend(timezone);
    if (!timeSelect) {
      throw new BadRequestException('timeSelect not entered');
    }
    if (!displayFollowings) {
      const getPath = (timeSelect: 'monthly' | 'weekly') => {
        let locationPath = location?.trim()?.toLowerCase();
        let cachePath = `${this.prefixKey}/ranking`;
        if (!locationPath) {
          locationPath = 'nationwide';
        }
        cachePath = cachePath.concat(`/${timeSelect}/${locationPath}`);
        if (locationPath === 'nationwide') {
          return cachePath;
        }
        let reflectLocationId = String(locationId);
        if (locationPath === 'grade') {
          reflectLocationId = `${schoolId}-${locationId}`;
        }
        cachePath = cachePath.concat(`/${reflectLocationId}`);
        return cachePath;
      };
      let path = '';
      switch (timeSelect) {
        case 'month':
          path = getPath('monthly');
          break;
        case 'week':
          path = getPath('weekly');
        default:
          break;
      }
      if (!path) {
        return [];
      }
      const rankings = await this.cacheManager.get<
        {
          orderNumber: number;
          displayName: string;
          avatar: string;
          userId: string;
          xp: number;
          isCurrentUser: boolean;
          role: Role;
        }[]
      >(path);
      if (rankings?.length > 0) {
        const result = rankings.map((element) => {
          return {
            ...element,
            isCurrentUser: element.userId == userId,
          };
        });
        return result;
      }
      return [];
    } else {
      const time = timeSelect === 'week' ? 'weekly' : 'monthly';
      return this.usersService.userFollowingRanking(userId, time);
    }
  }
  public async getUserXpThisWeek(
    currentUserId: string,
    followUserId: string,
  ): Promise<Statistic> {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    currentUserId = currentUserId.trim();
    followUserId = followUserId.trim();
    if (!currentUserId || !followUserId) {
      throw new BadRequestException();
    }
    const startTime = dayjs().tz(VIETNAM_TIME_ZONE).startOf('week').toDate();
    const endTime = dayjs().endOf('day').toDate();
    // eslint-disable-next-line prefer-const
    let [currentUserXps, refUserXps] = await Promise.all([
      this.getXpStatistic(currentUserId, startTime, endTime),
      currentUserId !== followUserId
        ? this.getXpStatistic(followUserId, startTime, endTime)
        : new Promise<number[]>((resolve) => {
            resolve(new Array(7).fill(0));
          }),
    ]);
    if (currentUserId === followUserId) {
      refUserXps = currentUserXps;
    }
    const result: Statistic = {
      currentUserXp: currentUserXps.reduce((prev, curr) => prev + curr),
      followUserXp: refUserXps.reduce((prev, curr) => prev + curr),
      followUserXpStatistic: refUserXps,
      currentUserXpStatistic: currentUserXps,
    };
    return result;
  }

  public async getXpStatisticByAddress(
    filter?: any,
    locationId?: number,
    location?: string,
    schoolId?: number,
    role?: Role,
  ): Promise<LeanDocument<ScoreStatisticDocument>[]> {
    try {
      let locationFilter: any = {};
      let roleFilter: any = {};
      if (role && role !== Role.Admin) {
        roleFilter = { 'user.role': { $eq: role } };
      }
      if (location) {
        switch (location) {
          case Location.Province:
            locationFilter = { 'user.address.province': { $eq: locationId } };
            break;
          case Location.District:
            locationFilter = { 'user.address.district': { $eq: locationId } };
            break;
          case Location.School:
            locationFilter = { 'user.address.school': { $eq: locationId } };
            break;
          case Location.Grade:
            locationFilter = {
              'user.address.school': { $eq: schoolId },
              'user.address.grade': { $eq: locationId },
            };
            break;
          default:
            break;
        }
      }
      const result = await this.scoreStatisticModel
        .aggregate([
          { $match: filter },
          {
            $group: {
              _id: { user: '$user' },
              totalXp: { $sum: '$xp' },
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id.user',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $project: {
              _id: 0,
              xp: '$totalXp',
              user: {
                $arrayElemAt: ['$user', 0],
              },
            },
          },
          {
            $project: {
              xp: 1,
              user: {
                _id: '$user._id',
                role: '$user.role',
                avatar: '$user.avatar',
                displayName: '$user.displayName',
                address: '$user.address',
              },
            },
          },
          {
            $match: { ...locationFilter, ...roleFilter },
          },
          { $sort: { xp: -1 } },
        ])
        .limit(10);
      return result;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  private async getTotalXp(
    displayFollowings: boolean,
    filter?: any,
    locationId?: number,
    location?: string,
    schoolId?: number,
    userId?: string,
    role?: Role,
  ): Promise<UserRank[]> {
    try {
      const xpArr: UserRank[] = [];
      let tempArr: LeanDocument<ScoreStatisticDocument>[] = [];
      if (displayFollowings) {
        tempArr = await this.getXpStatisticByAddress(
          filter,
          undefined,
          undefined,
          undefined,
          role,
        );
        const followingIds = await this.getFollowingIds(userId);
        tempArr = tempArr.filter((i) => {
          const user = i.user as unknown as UserDocument;
          return followingIds.includes(user._id.toHexString());
        });
      } else {
        tempArr = await this.getXpStatisticByAddress(
          filter,
          locationId,
          location,
          schoolId,
          role,
        );
      }
      if (!tempArr || tempArr.length == 0) {
        return [];
      }
      const prevUser = this.scoreStatisticsHelper.getFirstUserNotNull(tempArr);
      let orderNumber = 1;
      if (tempArr?.length > 0) {
        tempArr.forEach((element) => {
          const user = element?.user as unknown as UserDocument;
          if (user) {
            const userRank: UserRank = {
              orderNumber: orderNumber,
              displayName: user?.displayName,
              avatar: user?.avatar,
              userId: user?._id,
              xp: element.xp,
              isCurrentUser: userId && user?._id === userId,
              role: prevUser.role,
            };
            xpArr.push(userRank);
            orderNumber++;
          }
        });
        return xpArr;
      }
      return [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async addXpAfterSaveLesson(xp: number, userId: string): Promise<void> {
    try {
      dayjs.extend(utc);
      dayjs.extend(timezone);
      const startTime = dayjs().tz(VIETNAM_TIME_ZONE).startOf('day').toDate();
      const formatTimeStart = dayjs()
        .tz(VIETNAM_TIME_ZONE)
        .startOf('day')
        .format('DD-MM-YYYY')
        .toString();
      const endTime = dayjs().toDate();
      const filter = {
        user: new Types.ObjectId(userId),
        createdAt: {
          $gte: startTime,
          $lte: endTime,
        },
      };
      const hasScoreInToDay = await this.cacheManager.get<boolean>(
        `${this.prefixKey}/scoreRecord/${userId}/${formatTimeStart}`,
      );
      let userXpRecord: LeanDocument<ScoreStatisticDocument>;
      if (!hasScoreInToDay) {
        userXpRecord = await this.scoreStatisticModel
          .findOne(filter)
          .select(['_id'])
          .lean();
        if (userXpRecord) {
          await this.cacheManager.set<boolean>(
            `${this.prefixKey}/scoreRecord/${userId}/${formatTimeStart}`,
            true,
            { ttl: MAX_TTL },
          );
        }
      }
      if (userXpRecord || hasScoreInToDay) {
        await this.scoreStatisticModel.updateOne(filter, {
          $inc: { xp: xp },
        });
        return;
      } else if (!userXpRecord) {
        const newRecord = await this.scoreStatisticModel.create({
          xp: xp,
          user: Types.ObjectId(userId),
        });
        if (newRecord) {
          await this.cacheManager.set<boolean>(
            `${this.prefixKey}/scoreRecord/${userId}/${formatTimeStart}`,
            true,
            { ttl: MAX_TTL },
          );
          return;
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  private async getXpStatistic(
    userId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<number[]> {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const statisticLength = 7;
    const xpStatistic = await this.scoreStatisticModel
      .find({
        user: new Types.ObjectId(userId),
        createdAt: {
          $gte: startTime,
          $lte: endTime,
        },
      })
      .limit(statisticLength)
      .select(['xp', 'createdAt'])
      .lean();
    const xpStatisticResult: number[] = new Array(statisticLength).fill(0);
    for (const item of xpStatistic) {
      xpStatisticResult[
        dayjs(item.createdAt).tz(VIETNAM_TIME_ZONE).get('day')
      ] = item.xp;
    }

    return xpStatisticResult;
  }

  public async findScoreStatisticRecords(userId: string) {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const formatTimeStart = dayjs()
      .tz(VIETNAM_TIME_ZONE)
      .startOf('day')
      .subtract(1, 'day')
      .format('DD-MM-YYYY')
      .toString();
    const hasScoreInToDay = await this.cacheManager.get<boolean>(
      `${this.prefixKey}/scoreRecord/${userId}/${formatTimeStart}`,
    );
    return hasScoreInToDay;
  }

  public async createRecord(body: CreateRecordDto) {
    return this.scoreStatisticModel.create({
      user: Types.ObjectId(body.user),
      xp: Number(body.xp),
      createdAt: new Date(body.createdAt),
      updatedAt: new Date(body.updatedAt),
    });
  }

  public async adminUpdate() {
    const backups = await this.scoreStatisticModel.find();
    await this.scoreStatisticModel.deleteMany({});
    await this.scoreStatisticModel.insertMany(backups);
  }

  public async getFollowingIds(userId: string): Promise<string[]> {
    const followings = await this.followingsService.followings(userId);
    return followings.map((i) => String(i.followUser));
  }

  public async totalXpWithFilter(filter: any) {
    const result = await this.scoreStatisticModel.aggregate([
      {
        $match: filter ? filter : {},
      },
      {
        $group: {
          _id: { user: '$user' },
          totalXp: { $sum: '$xp' },
        },
      },
      {
        $project: {
          _id: '$_id.user',
          totalXp: '$totalXp',
        },
      },
      {
        $limit: 15,
      },
    ]);
    return result;
  }
}
