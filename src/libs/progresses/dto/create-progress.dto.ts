import { Types } from "mongoose";


export class CreateProgressDto {
    userId: Types.ObjectId;
    books: Array<any>;
}
