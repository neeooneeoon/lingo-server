import { Statistic } from "@dto/leaderBoard/statistic.dto";
import { UserRank } from "@dto/leaderBoard/userRank.dto";
import { UserProfile } from "@dto/user";
import { ScoreStatistic, ScoreStatisticDocument } from "@entities/scoreStatistic.entity";
import { UserDocument } from "@entities/user.entity";
import { UsersService } from "@libs/users/providers/users.service";
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as dayjs from 'dayjs';
import { Model, Types } from "mongoose";
import { from, Observable, of } from "rxjs";





@Injectable()
export class ScoreStatisticsService {
    constructor(
        @InjectModel(ScoreStatistic.name) private scoreStatisticModel: Model<ScoreStatisticDocument>,
        @Inject(forwardRef(() => UsersService)) private usersService: UsersService
    ) { }

    public async getRankByTime(userId: string, timeSelect: string): Promise<UserRank[]> {
        let topLength = 10;
        timeSelect = timeSelect.trim();
        if (!timeSelect) {
            throw new BadRequestException('timeSelect not entered');
        }
        let startTime: string;
        let xpArr: UserRank[] = [];
        switch (timeSelect) {
            case 'week':
                startTime = dayjs().startOf('week').format();
                break;
            case 'month':
                startTime = dayjs().startOf('month').format();
                break;
            case 'all':
                xpArr = await this.usersService.getAllTimeUserXpList();
                break;
            default:
                break;
        }
        const endTime = dayjs().format();
        if (timeSelect != 'all') {
            const filter = {
                createdAt: {
                    $gte: startTime,
                    $lte: endTime
                }
            }
            xpArr = await this.getTotalXp(userId, filter);
        }
        const userResult = await this.usersService.queryMe(userId);
        if (xpArr.length == 0) {
            xpArr.push(
                {
                    orderNumber: 1,
                    displayName: userResult.displayName,
                    avatar: userResult.avatar,
                    userId: new Types.ObjectId(userId),
                    xp: userResult.xp,
                    isCurrentUser: true
                }
            );
            return xpArr;
        }

        if (xpArr.length < topLength) topLength = xpArr.length;
        let isInTop = false;
        for (let i = 0; i < topLength; i++) {
            const item = xpArr[i];
            if (item.userId.toHexString() == userId) {
                isInTop = true;
                item.isCurrentUser = true;
            }
            item.orderNumber = i + 1;
        }
        if (isInTop == false) {
            let lastUser: UserRank;
            for (let i = 0; i < xpArr.length; i++) {
                const item = xpArr[i];
                if (item.userId.toHexString() == userId) {
                    item.orderNumber = i + 1;
                    item.isCurrentUser = true;
                    lastUser = item;
                    break;
                }
            }
            if (!lastUser) {
                lastUser = {
                    orderNumber: xpArr.length + 1,
                    displayName: userResult.displayName,
                    avatar: userResult.avatar,
                    userId: new Types.ObjectId(userId),
                    xp: userResult.xp,
                    isCurrentUser: true
                }
            }

            xpArr = xpArr.slice(0, 8);
            xpArr.push(lastUser);
        }
        return xpArr.slice(0, 9);
    }
    public async getUserXpThisWeek(currentUserId: string, followUserId: string): Promise<Statistic> {
        //  await this.generateXP();
        currentUserId = currentUserId.trim();
        followUserId = followUserId.trim()
        if (!currentUserId || !followUserId) {
            throw new BadRequestException('currentUserId or followUserId not entered ');
        }
        const startTime = dayjs().startOf('week').format();
        const endTime = dayjs().format();
        const filter = {
            user:
            {
                $in: [
                    new Types.ObjectId(currentUserId),
                    new Types.ObjectId(followUserId)
                ]
            },
            createdAt: {
                $gte: new Date(startTime),
                $lte: new Date(endTime)
            }
        };
        let followUser: UserProfile;
        let xpArr: UserRank[];
        //xpArr = await this.getTotalXp(currentUserId, filter);
        const promises = await Promise.all([
            this.usersService.queryMe(followUserId),
            this.getTotalXp(currentUserId, filter),
            this.getXpStatistic(followUserId, startTime, endTime)
        ]);
        followUser = promises[0];
        if (!followUser) {
            throw new BadRequestException('Can not find follow user');
        }
        xpArr = promises[1];
        const weekStatistic = promises[2];
        //console.log(weekStatistic);

        let result: Statistic = { currentUserXp: -1, followUserXp: -1, followUserXpStatistic: weekStatistic };
        for (let i = 0; i < 2; i++) {
            if (i >= xpArr.length) {
                if (result.currentUserXp == -1) result.currentUserXp = 0;
                if (result.followUserXp == -1) result.followUserXp = 0;
            }
            else {
                if (xpArr[i].isCurrentUser) {
                    result.currentUserXp = xpArr[i].xp;
                }
                else {
                    result.followUserXp = xpArr[i].xp
                }
            }
        }

        return result;
    }

    private async getTotalXp(userId: string, filter?: any): Promise<UserRank[]> {
        try {
            let xpArr: UserRank[] = [];
            let tempArr: ScoreStatisticDocument[];
            if (filter) {
                tempArr = await this.scoreStatisticModel.find(filter).populate('user', ['displayName', 'avatar']);

            }
            else {
                tempArr = await this.scoreStatisticModel.find({}).populate('user', ['displayName', 'avatar']);
            }

            if (!tempArr || tempArr.length == 0) {
                return [];
            }
            tempArr.sort(function compareFn(firstEl, secondEl) {
                if (firstEl.user < secondEl.user) return -1;
                if (firstEl.user > secondEl.user) return 1;
                return 0;
            });


            let prevUser: UserDocument = tempArr[0].user as unknown as UserDocument;
            let totalXp: number = 0;
            for (let i: number = 0; i < tempArr.length; i++) {
                let item = tempArr[i];
                const currentUser = item.user as unknown as UserDocument;

                if (currentUser._id.toHexString() == prevUser._id.toHexString()) {
                    totalXp += item.xp;
                }
                else {
                    const userRank: UserRank = {
                        orderNumber: 0,
                        displayName: prevUser.displayName,
                        avatar: prevUser.avatar,
                        userId: prevUser._id,
                        xp: totalXp,
                        isCurrentUser: false
                    }
                    if (userRank.userId.toHexString() == userId) userRank.isCurrentUser = true;
                    xpArr.push(userRank);
                    totalXp = 0;
                    prevUser = currentUser;
                    i--;
                }

                if (i == tempArr.length - 1) {
                    const userRank: UserRank = {
                        orderNumber: 0,
                        displayName: prevUser.displayName,
                        avatar: prevUser.avatar,
                        userId: prevUser._id,
                        xp: totalXp,
                        isCurrentUser: false
                    }
                    if (userRank.userId.toHexString() == userId) userRank.isCurrentUser = true;
                    xpArr.push(userRank);
                }
            }
            xpArr.sort(function compareFn(firstEl, secondEl) {
                if (firstEl.xp < secondEl.xp) return 1;
                if (firstEl.xp > secondEl.xp) return -1;
                return 0;
            })
            return xpArr;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
    public async addXpAfterSaveLesson(xp: number, userId: string): Promise<void> {
        try {
            const startTime = dayjs().startOf('day').format();
            const endTime = dayjs().format();
            const filter = {
                user: new Types.ObjectId(userId),
                createdAt: {
                    $gte: new Date(startTime),
                    $lte: new Date(endTime)
                }
            };
            const userXpRecord = await this.scoreStatisticModel.findOne(filter);
            if (userXpRecord) {
                await this.scoreStatisticModel.findOneAndUpdate(filter, { xp: userXpRecord.xp + xp });
                return;
            }
            await new this.scoreStatisticModel({ xp: xp, user: new Types.ObjectId(userId) }).save();
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
    private async getXpStatistic(userId: string, startTime: string, endTime: string): Promise<number[]> {
        const statisticLength = 7;
        let xpStatistic = await this.scoreStatisticModel.find({
            user: new Types.ObjectId(userId),
            createdAt: {
                $gte: new Date(startTime),
                $lte: new Date(endTime)
            }
        });
        let xpStatisticResult: number[] = new Array(statisticLength).fill(0);
        for (const item of xpStatistic) {
            xpStatisticResult[dayjs(item.createdAt).get('day')] = item.xp;
        }
        return xpStatisticResult;
    }

    public findScoreStatisticRecords(userId: string): Observable<ScoreStatisticDocument[]> {
        const startDateAsString = dayjs().startOf('day').subtract(1, 'day').format();
        const endDateAsString = dayjs().endOf('day').subtract(1, 'day').format();
        const startDate = new Date(startDateAsString);
        const endDate = new Date(endDateAsString);

        const records$ = from(
            this.scoreStatisticModel
                .find({
                    user: Types.ObjectId(userId),
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                })
        )
        return records$;
    }

    // public async generateXP() {
    //     const createdAt = dayjs().subtract(2, 'days').format();
    //     await new this.scoreStatisticModel({ xp: 35, createdAt: createdAt, user: new Types.ObjectId('60d69b497562563750e9a5a1') }).save();
    // }

}