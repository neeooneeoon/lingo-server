import { LeaderBoard, LeaderBoardDocument } from '@entities/leaderBoard.entity';
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsersService } from '@libs/users/providers/users.service';
import { Rank } from '@utils/enums';
import { User, UserDocument } from '@entities/user.entity';

@Injectable()
export class LeaderBoardsService {
  constructor(
    @InjectModel(LeaderBoard.name)
    private leaderBoardModel: Model<LeaderBoardDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
  ) {}

  public async getLeaderBoard(
    userId: Types.ObjectId | string,
    rank: Rank,
  ): Promise<Partial<LeaderBoardDocument>> {
    try {
      let leaderBoard = await this.leaderBoardModel.findOne({
        rank: rank,
        'champions.userId': userId,
      });

      if (!leaderBoard) {
        leaderBoard = await this.leaderBoardModel.findOne({
          rank: rank,
          group: 1,
        });
      }
      const userIds = leaderBoard.champions.map((item) => item.userId);
      const users = await this.usersService.findByIds(userIds);

      const result = {
        champions: leaderBoard.champions.map((champion) => {
          const user = users.find(
            (user) => String(user._id) === String(champion.userId),
          );
          return {
            displayName: user.displayName,
            userId: user._id,
            point: champion.point,
            image: user.avatar,
          };
        }),
        group: leaderBoard.group,
        rank: leaderBoard.rank,
        index: leaderBoard.index,
      };
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async updateUserPointDto(
    user: UserDocument,
    point: number,
  ): Promise<void> {
    try {
      const leaderBoard = await this.leaderBoardModel.findOne({
        rank: user.rank,
        'champions.userId': user._id,
      });
      if (leaderBoard) {
        if (leaderBoard.champions.length > 0) {
          const champion = leaderBoard.champions.find(
            (item) => String(item.userId) === String(user._id),
          );
          if (champion) {
            champion.point += point;
            await leaderBoard.save();
            return;
          }
        }
      } else {
        let leaderBoards = await this.leaderBoardModel.find({
          rank: user.rank,
        });
        leaderBoards = leaderBoards.sort((l1, l2) => l1.group - l2.group);
        for (const leaderBoard of leaderBoards) {
          if (leaderBoard.champions.length > 50) continue;
          leaderBoard.champions.push({
            userId: user._id,
            point: point,
            image: '',
            displayName: '',
          });
          await leaderBoard.save();
          return;
        }
        await this.leaderBoardModel.create({
          index: leaderBoards[leaderBoards.length - 1].index,
          group: leaderBoards[leaderBoards.length - 1].group + 1,
          rank: user.rank,
          champions: [
            { userId: user._id, point: point, image: '', displayName: '' },
          ],
        });
        return;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
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
