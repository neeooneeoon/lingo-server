import { FollowingDocument } from '@entities/following.entity';

export class FriendsDto {
  followers: FollowingDocument[];

  followings: FollowingDocument[];
}
