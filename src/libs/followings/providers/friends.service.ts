import { Following, FollowingDocument } from "@entities/following.entity";
import { UserDocument } from "@entities/user.entity";
import { UsersService } from "@libs/users/providers/users.service";
import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { from, Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";

@Injectable()
export class FriendsService {

    constructor(
        @InjectModel(Following.name) private followingModel: Model<FollowingDocument>,
        @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    ) { }

    public getFollowers(userId: string, currentPage: number): Observable<FollowingDocument[] | any> {
        const nPerPage = 15;
        const nSkip = currentPage === 0 ? 0 : (currentPage - 1) * nPerPage;
        const userRef = ['displayName', 'avatar', 'xp'];
        const unSelect = ['-__v', '-tags', '-followUser'];

        const followers$ = from(
            this.usersService.queryMe(userId)
        )
            .pipe(
                map(existsUser => {
                    if (!existsUser) {
                        throw new BadRequestException(`Can't not find user ${userId}`);
                    }
                    return existsUser;
                }),
                switchMap(() => from(
                    this.followingModel
                        .find({
                            followUser: Types.ObjectId(userId)
                        })
                        .skip(nSkip)
                        .limit(nPerPage)
                        .populate('user', userRef)
                        .select(unSelect)
                )),
                map(followers => {
                    return followers.map(follower => {
                        const user = follower.user as unknown as Partial<UserDocument>;
                        return {
                            _id: follower._id,
                            followUser :{
                                avatar: user.avatar,
                                _id: user._id,
                                displayName: user.displayName,
                                xp: user.xp
                            }
                        }
                    })
                })
            )
        return followers$;
    }

    public getFollowingsOtherUser(userId: string, currentPage: number): Observable<FollowingDocument[]> {
        const nPerPage = 15;
        const nSkip = currentPage <= 0 ? 0 : (currentPage - 1) * nPerPage;
        const followUserRef = ['displayName', 'avatar', 'xp'];
        const unSelect = ['-__v', '-tags', '-user'];
        const followings$ = from(
            this.usersService.queryMe(userId)
        )
            .pipe(
                map(existsUser => {
                    if (!existsUser) {
                        throw new BadRequestException(`Can't not find user ${userId}`);
                    }
                    return existsUser;
                }),
                switchMap(() => from(
                    this.followingModel
                        .find({
                            user: Types.ObjectId(userId)
                        })
                        .skip(nSkip)
                        .limit(nPerPage)
                        .populate('followUser', followUserRef)
                        .select(unSelect)
                ))
            )
        return followings$;
    }

    public getMyFollowings(currentUser: string, tagIds: string[], currentPage: number) {
        const nPerPage = 15;
        const nSkip = currentPage <= 0 ? 0 : (currentPage - 1) * nPerPage;
        const followUserRef = ['displayName', 'avatar', 'xp'];
        const tagRef = ['color', 'name'];
        const unSelect = ['-__v'];

        if (tagIds.includes('all')) {
            const followings$ = from(
                this.followingModel
                .find({
                    user: Types.ObjectId(currentUser)
                })
                .skip(nSkip)
                .limit(nPerPage)
                .populate('followUser', followUserRef)
                .populate('tags', tagRef)
                .select(unSelect)
            );
            return followings$;
        }
        else {
            const followings$ = from(
                this.followingModel
                .find({
                    user: Types.ObjectId(currentUser),
                    tags: {
                        $elemMatch: {
                            $in: tagIds
                        }
                    }
                })
                .skip(nSkip)
                .limit(nPerPage)
                .populate('followUser', followUserRef)
                .populate('tags', tagRef)
                .select(unSelect)
            );
            return followings$;
        }
    }

}