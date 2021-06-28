import { Types } from "mongoose";

export class FollowingUser {

    user: Types.ObjectId;
    tag?: Types.ObjectId;

}