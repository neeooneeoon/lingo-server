import { Types } from "mongoose";

export class CreateUserProgressDto {
    userId: Types.ObjectId;
    books: Array<any>;
}