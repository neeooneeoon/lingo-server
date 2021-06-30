import { Types } from "mongoose";

export class UserRank {
    isCurrentUser: boolean;
    orderNumber: number;
    displayName: string;
    avatar: string;
    userId: Types.ObjectId;
    totalScore: number;
}