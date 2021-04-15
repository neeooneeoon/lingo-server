import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from '../users/schema/user.schema';
import { LeaderBoard, LeaderBoardDocument, Rank } from './schema/leaderBoard.schema';
import { UsersService } from 'src/libs/users/users.service';

@Injectable()
export class LeaderBoardService {
    constructor(
        @InjectModel(LeaderBoard.name) private readonly leaderBoardModel: Model<LeaderBoardDocument>,
         private readonly userService: UsersService
    ) { }

    async getLeaderBoard(userId: string, rank: Rank) {
        try {
            let leaderBoard = await this.leaderBoardModel.findOne({
                rank: rank,
                "champions.userId": Types.ObjectId(userId)
            })
            if (!leaderBoard) {
                leaderBoard = await this.leaderBoardModel.findOne({ rank: rank, group: 1 });
            }
            const userIds = leaderBoard.champions.map(e => e.userId);
            const users = await this.userService.findUserByLeaderBoardChampion(userIds);
            if (users) {
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
                return result
            }
            return null
        }
        catch (e) {
            throw new InternalServerErrorException(e)
        }
    }

    async updateUserPoint(user: UserDocument, point: number): Promise<void> {
        try {
            const leaderBoard = await this.leaderBoardModel.findOne({ rank: user.rank, "champions.userId": user._id })
            if (leaderBoard) {
                const champion = leaderBoard.champions.find(champion => String(champion.userId) === String(user._id));
                champion.point += point;
                await leaderBoard.save();
                return;
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
        }
        catch (e) {
            throw new InternalServerErrorException(e)
        }
    }
}