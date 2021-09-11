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
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { VIETNAM_TIME_ZONE } from '@utils/constants';
import { LeanDocument, Model, Types } from 'mongoose';
import { Location, Role } from '@utils/enums';
import { TOP_XP_LENGTH } from '@utils/constants';
import { CreateRecordDto } from '@dto/leaderBoard/createRecord.dto';
import { FollowingsService } from '@libs/followings/providers/followings.service';

@Injectable()
export class ScoreStatisticsService {
  constructor(
    @InjectModel(ScoreStatistic.name)
    private scoreStatisticModel: Model<ScoreStatisticDocument>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    private scoreStatisticsHelper: ScoreStatisticsHelper,
    private followingsService: FollowingsService,
  ) {}

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
  public async getUserXpThisWeek(
    currentUserId: string,
    followUserId: string,
  ): Promise<Statistic> {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    currentUserId = currentUserId.trim();
    followUserId = followUserId.trim();
    if (!currentUserId || !followUserId) {
      throw new BadRequestException(
        'currentUserId or followUserId not entered ',
      );
    }
    const startTime = dayjs().tz(VIETNAM_TIME_ZONE).startOf('week').toDate();
    const endTime = dayjs().toDate();
    const filter = {
      user: {
        $in: [
          new Types.ObjectId(currentUserId),
          new Types.ObjectId(followUserId),
        ],
      },
      createdAt: {
        $gte: startTime,
        $lte: endTime,
      },
    };
    const promises = await Promise.all([
      this.usersService.queryMe(followUserId),
      this.getTotalXp(false, filter),
      this.getXpStatistic(followUserId, startTime, endTime),
      this.getXpStatistic(currentUserId, startTime, endTime),
    ]);
    const followUser = promises[0];
    if (!followUser) {
      throw new BadRequestException('Can not find follow user');
    }

    const xpArr = promises[1];
    const followUserWeekStatistic = promises[2];
    const currentUserWeekStatistic = promises[3];
    const result: Statistic = {
      currentUserXp: -1,
      followUserXp: -1,
      followUserXpStatistic: followUserWeekStatistic,
      currentUserXpStatistic: currentUserWeekStatistic,
    };
    for (let i = 0; i < 2; i++) {
      if (i >= xpArr.length) {
        if (result.currentUserXp == -1) result.currentUserXp = 0;
        if (result.followUserXp == -1) result.followUserXp = 0;
      } else {
        if (xpArr[i].userId.toHexString() == currentUserId) {
          result.currentUserXp = xpArr[i].xp;
        }
        if (xpArr[i].userId.toHexString() == followUserId) {
          result.followUserXp = xpArr[i].xp;
        }
      }
    }

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
      const endTime = dayjs().toDate();
      const filter = {
        user: new Types.ObjectId(userId),
        createdAt: {
          $gte: startTime,
          $lte: endTime,
        },
      };
      const userXpRecord = await this.scoreStatisticModel.findOne(filter);
      if (userXpRecord) {
        await this.scoreStatisticModel.findOneAndUpdate(filter, {
          xp: userXpRecord.xp + xp,
        });
        return;
      }
      await new this.scoreStatisticModel({
        xp: xp,
        user: new Types.ObjectId(userId),
      }).save();
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
    const xpStatistic = await this.scoreStatisticModel.find({
      user: new Types.ObjectId(userId),
      createdAt: {
        $gte: startTime,
        $lte: endTime,
      },
    });
    const xpStatisticResult: number[] = new Array(statisticLength).fill(0);
    for (const item of xpStatistic) {
      xpStatisticResult[
        dayjs(item.createdAt).tz(VIETNAM_TIME_ZONE).get('day')
      ] = item.xp;
    }

    return xpStatisticResult;
  }

  public async findScoreStatisticRecords(
    userId: string,
  ): Promise<ScoreStatisticDocument[]> {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const startDate = dayjs()
      .tz(VIETNAM_TIME_ZONE)
      .startOf('day')
      .subtract(1, 'day')
      .toDate();
    const endDate = dayjs()
      .tz(VIETNAM_TIME_ZONE)
      .endOf('day')
      .subtract(1, 'day')
      .toDate();

    return this.scoreStatisticModel.find({
      user: Types.ObjectId(userId),
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });
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
}
