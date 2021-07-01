import { LeaderBoard, LeaderBoardDocument } from "@entities/leaderBoard.entity";
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UsersService } from "@libs/users/providers/users.service";
import { Rank } from "@utils/enums";
import { User, UserDocument } from '@entities/user.entity';
import * as dayjs from 'dayjs';
import { ScoreStatistic, ScoreStatisticDocument } from "@entities/scoreStatistic.entity";
import { UserRank } from "@dto/leaderBoard/userRank.dto";
import { isNotEmpty } from "class-validator";

@Injectable()
export class LeaderBoardsService {

    constructor(
        @InjectModel(LeaderBoard.name) private leaderBoardModel: Model<LeaderBoardDocument>,
        @InjectModel(ScoreStatistic.name) private scoreStatisticModel: Model<ScoreStatisticDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    ) { }

    public async getLeaderBoard(userId: Types.ObjectId | string, rank: Rank): Promise<Partial<LeaderBoardDocument>> {
        try {
            let leaderBoard = await this.leaderBoardModel.findOne({
                rank: rank,
                "champions.userId": userId
            });

            if (!leaderBoard) {
                leaderBoard = await this.leaderBoardModel.findOne({
                    rank: rank,
                    group: 1
                });
            }
            const userIds = leaderBoard.champions.map(item => item.userId);
            const users = await this.usersService.findByIds(userIds);

            const result = {
                champions: leaderBoard.champions.map(champion => {
                    const user = users.find(user => String(user._id) === String(champion.userId));
                    return {
                        displayName: user.displayName,
                        userId: user._id,
                        point: champion.point,
                        image: user.avatar
                    };
                }),
                group: leaderBoard.group,
                rank: leaderBoard.rank,
                index: leaderBoard.index
            };
            return result;

        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async updateUserPointDto(user: UserDocument, point: number): Promise<void> {
        try {
            const leaderBoard = await this.leaderBoardModel.findOne({
                rank: user.rank,
                "champions.userId": user._id
            });
            if (leaderBoard) {
                if (leaderBoard.champions.length > 0) {
                    const champion = leaderBoard.champions.find(item => String(item.userId) === String(user._id));
                    if (champion) {
                        champion.point += point;
                        await leaderBoard.save();
                        return;
                    }
                }
            }
            else {
                let leaderBoards = await this.leaderBoardModel.find({ rank: user.rank });
                leaderBoards = leaderBoards.sort((l1, l2) => l1.group - l2.group);
                for (const leaderBoard of leaderBoards) {
                    if (leaderBoard.champions.length > 50) continue;
                    leaderBoard.champions.push({
                        userId: user._id,
                        point: point,
                        image: "",
                        displayName: ""
                    });
                    await leaderBoard.save();
                    return;
                }
                await this.leaderBoardModel.create({
                    index: leaderBoards[leaderBoards.length - 1].index,
                    group: leaderBoards[leaderBoards.length - 1].group + 1,
                    rank: user.rank,
                    champions: [{ userId: user._id, point: point, image: "", displayName: "" }]
                });
                return;
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
    public async getRanksByTime(userId: string, timeSelect: string): Promise<UserRank[]> {
        let top_length = 9;
        timeSelect = timeSelect.trim();
        if (!timeSelect) {
            throw new BadRequestException('timeSelect not entered');
        }
        let startTime: string;
        let scoreArr: UserRank[] = [];
        switch (timeSelect) {
            case 'week':
                startTime = dayjs().startOf('week').format();
                break;
            case 'month':
                startTime = dayjs().startOf('month').format();
                break;
            case 'all':
                const userRankList = await this.userModel.find({}).sort({ score: -1 }).select({ score: 1, displayName: 1, avatar: 1 });
                if (!userRankList) {
                    throw new BadRequestException("Can not find");
                }
                for (let i = 0; i < userRankList.length; i++) {
                    const item = userRankList[i];
                    scoreArr.push({
                        orderNumber: i + 1,
                        displayName: item.displayName,
                        avatar: item.avatar,
                        userId: item._id,
                        totalScore: item.score,
                        isCurrentUser: false
                    })
                }
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

            if (!scoreArr) {
                throw new BadRequestException('Can not find');
            }
            tempArr.sort(function comapareFn(firstEl, secondEl) {
                if (firstEl.user < secondEl.user) return -1;
                if (firstEl.user > secondEl.user) return 1;
                return 0;
            });

            let temp: Types.ObjectId;
            for (const item of tempArr) {
                const user = item.user as unknown as UserDocument;
                if (user) {
                    temp = user._id;
                    break;
                }
            }
            let totalScore: number = 0;
            let prevUser: UserDocument;
            for (let i: number = 0; i < tempArr.length; i++) {
                let item = tempArr[i];
                const user = item.user as unknown as UserDocument;
                if (user && temp) {
                    prevUser = user;
                    if (user._id.toHexString() == temp.toHexString()) {
                        totalScore += item.score;
                    }
                    else {
                        scoreArr.push(
                            {
                                orderNumber: 0,
                                displayName: user.displayName,
                                avatar: user.avatar,
                                userId: temp,
                                totalScore: totalScore,
                                isCurrentUser: false
                            }
                        );
                        totalScore = 0;
                        temp = user._id;
                        i--;
                    }
                }
                if (i == tempArr.length - 1 && prevUser) {
                    scoreArr.push(
                        {
                            orderNumber: 0,
                            displayName: prevUser.displayName,
                            avatar: prevUser.avatar,
                            userId: temp,
                            totalScore: totalScore,
                            isCurrentUser: false
                        }
                    )
                }
            }
            scoreArr.sort(function compareFn(firstEl, secondEl) {
                if (firstEl.totalScore < secondEl.totalScore) return 1;
                if (firstEl.totalScore > secondEl.totalScore) return -1;
                return 0;
            })
        }
        if (scoreArr.length == 0) {
            return scoreArr;
        }

        if (scoreArr.length < top_length) top_length = scoreArr.length;
        let result: UserRank[] = [];
        let isInTop = false;
        for (let i = 0; i < top_length; i++) {
            const item = scoreArr[i];
            if (item.userId.toHexString() == userId) {
                isInTop = true;
                item.isCurrentUser = true;
            }

            result.push(
                {
                    orderNumber: i + 1,
                    displayName: item.displayName,
                    avatar: item.avatar,
                    userId: item.userId,
                    totalScore: item.totalScore,
                    isCurrentUser: item.isCurrentUser
                }
            );
        }
        if (isInTop == false) {
            result.pop();
            for (let i = 0; i < scoreArr.length; i++) {
                const item = scoreArr[i];
                if (item.userId.toHexString() == userId) {
                    result.push(
                        {
                            userId: item.userId,
                            orderNumber: i + 1,
                            avatar: item.avatar,
                            displayName: item.displayName,
                            totalScore: item.totalScore,
                            isCurrentUser: true
                        }
                    )
                    break;
                }
            }
        }
        return result;
    }
    // public async generateRank(): Promise<void> {
    //     const my_id = "60d98e34b4383d196cbca392";
    //     let userId = my_id;
    //     const step = 5;
    //     let count = 0;
    //     for (let i = 0; i < 40; i++) {
    //         const score = Math.floor(Math.random() * 100);
    //         if (count < step) {
    //             count++;
    //             new this.scoreStatisticModel({ user: new Types.ObjectId(userId), score: score }).save();
    //         }
    //         else {
    //             userId = this.generateObjectId();
    //             count = 0;
    //         }
    //     }
    //     return;
    // }
    // public async addUser(): Promise<void> {
    //     const array_u = [...new Set(await this.userModel.find({}))];
    //     for(const item of array_u) {
    //         console.log(item._id);

    //         // await new this.userModel({
    //         //     streak:3,
    //         //     loginCount:15,
    //         //     score: Math.floor(Math.random()*1000),
    //         //     level: 5,
    //         //     role: "Member",
    //         //     language: "vi",
    //         //     grade: 0,
    //         //     birthday: null,
    //         //     familyName: "Hế lồ",
    //         //     avatar: "avatar url",
    //         //     facebookId: "sdfsdf",
    //         //     email: "hello@gmail.com",
    //         //     givenName: "Hê lô",
    //         //     displayName: "helo",
    //         //     xp: 55,
    //         //     rank: "None",
    //         //     lastActive: new Date('1970-01-01T00:00:00.000+00:00')
    //         // }).save()
    //     }
    // }
    // generateObjectId() {
    //     var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    //     return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
    //         return (Math.random() * 16 | 0).toString(16);
    //     }).toLowerCase();
    // }

}