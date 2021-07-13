import { Types } from 'mongoose';

export class Champion {
  image: string;
  userId: Types.ObjectId;
  point: number;
  displayName: string;
}
