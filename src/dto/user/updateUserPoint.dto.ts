import { UserDocument } from "@entities/user.entity";

export class UpdateUserPointDto {
    user: UserDocument;
    point: number;
}