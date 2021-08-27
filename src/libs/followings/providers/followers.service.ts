import { Following, FollowingDocument } from '@entities/following.entity';
import { UserDocument } from '@entities/user.entity';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from 'cache-manager';
import { Model, Types } from 'mongoose';
import { from, of, forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable()
export class FollowersService {
  private logger = new Logger();
  constructor(
    @InjectModel(Following.name)
    private followingModel: Model<FollowingDocument>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  public countFollowers(userId: string) {
    return from(this.cache.get<number>(`followers/${userId}`)).pipe(
      switchMap((total) => {
        if (total) {
          return of(total);
        } else {
          return from(
            this.followingModel.countDocuments({
              followUser: Types.ObjectId(userId),
            }),
          ).pipe(
            switchMap((value) => {
              this.cache
                .set<number>(`followers/${userId}`, value, { ttl: 10800 })
                .then((r) => {
                  this.logger.log({
                    status: r,
                    time: this.logger.getTimestamp(),
                  });
                });
              return of(value);
            }),
          );
        }
      }),
    );
  }

  public getFollowers(userId: string, currentPage: number) {
    const nPerPage = 15;
    const nSkip = currentPage === 0 ? 0 : (currentPage - 1) * nPerPage;
    const userRef = ['displayName', 'avatar', 'xp'];
    const unSelect = ['-__v', '-tags', '-followUser'];
    const total$ = from(this.countFollowers(userId));
    return forkJoin([
      total$,
      this.followingModel
        .find({
          followUser: Types.ObjectId(userId),
        })
        .skip(nSkip)
        .limit(nPerPage)
        .populate('user', userRef)
        .select(unSelect),
    ]).pipe(
      map(([total, followers]) => {
        const items = followers.map((follower) => {
          const user = follower.user as unknown as UserDocument;
          return {
            _id: follower._id,
            followUser: {
              avatar: user?.avatar,
              _id: user?._id,
              displayName: user?.displayName,
              xp: user?.xp,
            },
          };
        });
        return {
          total: total,
          items: items,
        };
      }),
    );
  }
}
