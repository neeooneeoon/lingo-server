import { Role } from '@utils/enums';
import { Types } from 'mongoose';

export class UserRank {
  isCurrentUser: boolean;
  orderNumber: number;
  displayName: string;
  avatar: string;
  userId: Types.ObjectId;
  xp: number;
  role?: Role;
}
