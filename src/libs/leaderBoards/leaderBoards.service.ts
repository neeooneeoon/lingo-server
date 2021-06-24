import { LeaderBoard, LeaderBoardDocument } from "@entities/leaderBoard.entity";
import { forwardRef, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UsersService } from "@libs/users/providers/users.service";
import { Rank } from "@utils/enums";

@Injectable()
export class LeaderBoardsService {

    constructor(
        @InjectModel(LeaderBoard.name) private leaderBoardModel: Model<LeaderBoardDocument>,
        @Inject(forwardRef(() => UsersService)) private usersService: UsersService
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

}