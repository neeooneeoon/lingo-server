import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "@entities/user.entity";
import { Model } from "mongoose";
import { UserProfile } from '@libs/users/dto/userProfile.dto';
import { SuccessResponse } from '@utils/types';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

    async getUserProfile(): Promise<SuccessResponse<UserProfile>> {
        try {
            return {
                data: {} as UserProfile,
                code: 1
            }
        }
        catch(error) {
            throw new InternalServerErrorException(error)
        }
    }
}