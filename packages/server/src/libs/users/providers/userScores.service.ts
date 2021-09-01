import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '@entities/user.entity';
import { Model, Types } from 'mongoose';
import { UpdateUserStatusDto, UserProfile } from '@dto/user';
import { UsersHelper } from '@helpers/users.helper';
import { Cache } from 'cache-manager';

@Injectable()
export class UserScoresService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private usersHelper: UsersHelper,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  public async updateUserStatus(input: UpdateUserStatusDto): Promise<void> {
    try {
      const { user, workInfo, isFinishLevel, point } = input;
      const xp = user.xp;
      const userDidUpdated = await this.userModel.findOneAndUpdate(
        { _id: user._id },
        {
          $set: {
            lastActive: workInfo.timeStart,
            level: isFinishLevel ? user.level + 1 : user.level,
            score: user.score + 1,
            xp: xp + point,
          },
        },
        {
          new: true,
        },
      );
      const profile = this.usersHelper.mapToUserProfile(userDidUpdated);
      await this.cache.set<UserProfile>(
        `profile/${String(userDidUpdated._id)}`,
        profile,
        { ttl: 7200 },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async bonusStoryScores(userId: string, totalScore: number) {
    if (totalScore > 0) {
      const updatedUser = await this.userModel.findOneAndUpdate(
        {
          _id: Types.ObjectId(userId),
        },
        {
          $inc: { xp: totalScore },
        },
      );
      if (!updatedUser) {
        throw new BadRequestException('Not found user');
      }
      const profile = this.usersHelper.mapToUserProfile(updatedUser);
      await this.cache.set<UserProfile>(`profile/${userId}`, profile);
      return;
    }
  }
}
