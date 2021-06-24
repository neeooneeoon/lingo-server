import { Types } from "mongoose";

export class CreateUserProgressDto {
    userId: Types.ObjectId | string;
    books: Array<any>;
}