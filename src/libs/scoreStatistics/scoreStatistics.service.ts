import { UserRank } from "@dto/leaderBoard/userRank.dto";
import { ScoreStatistic, ScoreStatisticDocument } from "@entities/scoreStatistic.entity";
import { UserDocument } from "@entities/user.entity";
import { UsersService } from "@libs/users/providers/users.service";
import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as dayjs from 'dayjs';
import { Model, Types } from "mongoose";




@Injectable()
export class ScoreStatisticsService {
    constructor(
        @InjectModel(ScoreStatistic.name) private scoreStatisticModel: Model<ScoreStatisticDocument>,
        @Inject(forwardRef(() => UsersService)) private usersService: UsersService
    ) { }

    public async getRankByTime(userId: string, timeSelect: string): Promise<UserRank[]> {
        let topLength = 9;
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
            xpArr = await this.getTotalXp(filter);
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
    public async getUserXpThisWeek(currentUserId: string, followUserId: string): Promise<Partial<UserRank>[]> {
        currentUserId = currentUserId.trim();
        followUserId = followUserId.trim()
        if (!currentUserId || !followUserId) {
            throw new BadRequestException('currentUserId or followUserId not entered ');
        }
        const currentUser = await this.usersService.queryMe(currentUserId);
        const followUser = await this.usersService.queryMe(followUserId);
        if (!currentUserId) {
            throw new BadRequestException('currentUser not exist')
        }
        if (!followUserId) {
            throw new BadRequestException('followUser not exist')
        }
        const startTime = dayjs().startOf('week').format();
        const endTime = dayjs().format();
        const filter = {
            user:
            {
                $in: [
                    new Types.ObjectId('60d69b497562563750e9a5a1'),
                    new Types.ObjectId('60d98e34b4383d196cbca392')
                ]
            },
            createdAt: {
                $gte: startTime,
                $lte: endTime
            }
        };
        const xpArr = await this.getTotalXp(filter);
        switch (xpArr.length) {
            case 0:
                return [{ xp: 0, isCurrentUser: true }, { xp: 0, isCurrentUser: false }];
            case 1:
            case 2:
                for (const item of xpArr) {
                    if (item.userId.toHexString() == currentUserId) {
                        item.isCurrentUser = true
                    }
                }
                break;
            default:
                break;
        }

        return xpArr;
    }

    private async getTotalXp(filter?: any): Promise<UserRank[]> {
        let xpArr: UserRank[] = [];
        let tempArr: ScoreStatisticDocument[] = [];
        if (filter) {
            tempArr = await this.scoreStatisticModel.find(filter).populate('user', ['displayName', 'avatar']);
        }
        else {
            tempArr = await this.scoreStatisticModel.find({}).populate('user', ['displayName', 'avatar']);
        }

        if (!tempArr) {
            throw new BadRequestException('Can not find');
        }
        tempArr.sort(function compareFn(firstEl, secondEl) {
            if (firstEl.user < secondEl.user) return -1;
            if (firstEl.user > secondEl.user) return 1;
            return 0;
        });


        let prevUser: UserDocument;
        for (const item of tempArr) {
            const user = item.user as unknown as UserDocument;
            if (user) {
                prevUser = user;
                break;
            }
        }

        let totalXp: number = 0;
        for (let i: number = 0; i < tempArr.length; i++) {
            let item = tempArr[i];
            const currentUser = item.user as unknown as UserDocument;
            if (currentUser && prevUser) {
                if (currentUser._id.toHexString() == prevUser._id.toHexString()) {
                    totalXp += item.xp;
                }
                else {
                    xpArr.push(
                        {
                            orderNumber: 0,
                            displayName: prevUser.displayName,
                            avatar: prevUser.avatar,
                            userId: prevUser._id,
                            xp: totalXp,
                            isCurrentUser: false
                        }
                    );
                    totalXp = 0;
                    prevUser = currentUser;
                    i--;
                }
            }
            if (i == tempArr.length - 1 && prevUser) {
                xpArr.push(
                    {
                        orderNumber: 0,
                        displayName: prevUser.displayName,
                        avatar: prevUser.avatar,
                        userId: prevUser._id,
                        xp: totalXp,
                        isCurrentUser: false
                    }
                )
            }
        }
        xpArr.sort(function compareFn(firstEl, secondEl) {
            if (firstEl.xp < secondEl.xp) return 1;
            if (firstEl.xp > secondEl.xp) return -1;
            return 0;
        })
        return xpArr;
    }
    public async addXpAfterSaveLesson(xp: number, userId: string): Promise<void> {
        const startTime = dayjs().startOf('day').format();
        const endTime = dayjs().format();
        console.log(startTime, endTime);
        
        const user = await this.usersService.queryMe(userId);
        if (!user) {
            throw new BadRequestException('Can not find user');
        }
        const filter = {
            user: new Types.ObjectId(userId),
            createdAt: {
                $gte: new Date(startTime),
                $lte: new Date(endTime)
            }
        };
        const userXpRecord = await this.scoreStatisticModel.findOne(filter);
        if (userXpRecord) {
            await this.scoreStatisticModel.findOneAndUpdate(filter, {xp: userXpRecord.xp+ xp});
            return;
        }
        await new this.scoreStatisticModel({xp: xp, user: new Types.ObjectId(userId)}).save();
    }
}