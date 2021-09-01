import { Following, FollowingDocument } from '@entities/following.entity';
import { UserDocument } from '@entities/user.entity';
import { UsersService } from '@libs/users/providers/users.service';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { forkJoin, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class FriendsService {
  constructor(
    @InjectModel(Following.name)
    private followingModel: Model<FollowingDocument>,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
  ) {}

  // public getFollowers(userId: string, currentPage: number) {
  //   const nPerPage = 15;
  //   const nSkip = currentPage === 0 ? 0 : (currentPage - 1) * nPerPage;
  //   const userRef = ['displayName', 'avatar', 'xp'];
  //   const unSelect = ['-__v', '-tags', '-followUser'];
  //   const total$ = from(
  //     this.followingModel
  //       .countDocuments({
  //         followUser: Types.ObjectId(userId),
  //       })
  //       .select(unSelect),
  //   );
  //   return forkJoin([
  //     total$,
  //     this.followingModel
  //       .find({
  //         followUser: Types.ObjectId(userId),
  //       })
  //       .skip(nSkip)
  //       .limit(nPerPage)
  //       .populate('user', userRef)
  //       .select(unSelect),
  //   ]).pipe(
  //     map(([total, followers]) => {
  //       const items = followers.map((follower) => {
  //         const user = follower.user as unknown as UserDocument;
  //         return {
  //           _id: follower._id,
  //           followUser: {
  //             avatar: user.avatar,
  //             _id: user._id,
  //             displayName: user.displayName,
  //             xp: user.xp,
  //           },
  //         };
  //       });
  //       return {
  //         total: total,
  //         items: items,
  //       };
  //     }),
  //   );
  // }

  // public getFollowingsOtherUser(userId: string, currentPage: number) {
  //   const nPerPage = 15;
  //   const nSkip = currentPage <= 0 ? 0 : (currentPage - 1) * nPerPage;
  //   const followUserRef = ['displayName', 'avatar', 'xp'];
  //   const unSelect = ['-__v', '-tags', '-user'];
  //   const total$ = from(
  //     this.followingModel.countDocuments({
  //       user: Types.ObjectId(userId),
  //     }),
  //   );
  //   return forkJoin([
  //     total$,
  //     this.followingModel
  //       .find({
  //         user: Types.ObjectId(userId),
  //       })
  //       .skip(nSkip)
  //       .limit(nPerPage)
  //       .populate('followUser', followUserRef)
  //       .select(unSelect),
  //   ]).pipe(
  //     map(([total, followings]) => {
  //       return {
  //         total: total,
  //         items: followings,
  //       };
  //     }),
  //   );
  // }

  // public async getAllFollowings(userId: string) {
  //   const user = await this.usersService.findById(userId);
  //   if (user && user.xp > 0) {
  //     const followUserRef = ['displayName', 'avatar', 'xp'];
  //     const unSelect = ['-__v', '-tags', '-user'];
  //     const followings = await this.followingModel
  //       .find({
  //         user: Types.ObjectId(userId),
  //       })
  //       .populate('followUser', followUserRef)
  //       .select(unSelect);
  //     if (followings?.length > 0) {
  //       const higherScoreUsers = followings.filter((item) => {
  //         const followUser = item.followUser as unknown as UserDocument;
  //         return followUser?.xp > user.xp;
  //       });
  //       if (higherScoreUsers?.length > 0) {
  //         return {
  //           currentUser: userId,
  //           followings: higherScoreUsers,
  //         };
  //       }
  //     }
  //   }
  // }
}
