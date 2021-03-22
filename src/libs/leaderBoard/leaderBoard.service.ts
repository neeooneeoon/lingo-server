import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schema/user.schema';
import { LeaderBoard, LeaderBoardDocument } from './schema/leaderBoard.schema';

@Injectable()
export class LeaderBoardService {
    constructor(@InjectModel(LeaderBoard.name) private readonly leaderBoardModel: Model<LeaderBoardDocument>) { }

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