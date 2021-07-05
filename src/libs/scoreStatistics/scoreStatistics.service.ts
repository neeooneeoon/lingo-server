import { UserRank } from "@dto/leaderBoard/userRank.dto";
import { ScoreStatistic, ScoreStatisticDocument } from "@entities/scoreStatistic.entity";
import { UserDocument } from "@entities/user.entity";
import { UsersService } from "@libs/users/providers/users.service";
import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as dayjs from 'dayjs';
import { Model, Types } from "mongoose";
import { from, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";



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
            const tempArr = await this.scoreStatisticModel.find(
                {
                    createdAt: {
                        $gte: new Date(startTime),
                        $lte: new Date(endTime)
                    }
                }
            ).populate('user', ['displayName', 'avatar']);

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

}