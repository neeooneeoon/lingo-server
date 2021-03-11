import { Types } from "mongoose";

export class CreateWorkDto {
    userId: Types.ObjectId | string;
    bookId: string;
    units: Array<any>;
}
