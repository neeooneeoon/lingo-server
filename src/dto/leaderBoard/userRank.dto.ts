import { Types } from "mongoose";

export class UserRank {
    orderNumber: number;
    displayName: string;
    avatar: string;
    userId: Types.ObjectId;
    totalScore: number;
}