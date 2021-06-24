import {
    BadRequestException,
    Injectable,
    InternalServerErrorException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User, UserDocument } from "@entities/user.entity";
import { AuthenticationService } from '@authentication/authentication.service';
import { GoogleService } from './google.service';
import { ProgressesService } from "@libs/progresses/progresses.service";
import { UsersHelper } from '@helpers/users.helper';
import { Rank, Role } from '@utils/enums';
import { UserProfile, UserLogin, FetchAccountInfo, UpdateUserDto } from "@dto/user";
import { FacebookService } from "./facebook.service";


@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly usersHelper: UsersHelper,
        private authService: AuthenticationService,
        private googleService: GoogleService,
        private facebookService: FacebookService,
        private progressesService: ProgressesService,
    ) { }

    public async findByIds(ids: Types.ObjectId[] | string[]): Promise<UserDocument[]> {
        try {
            const users = await this.userModel.find({
                _id: {
                    $in: ids
                }
            });
            return users;
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
    

    public async getUserProfile(fetchAccount: FetchAccountInfo): Promise<UserLogin> {
        const {
            email
        } = fetchAccount;

        const existsUser = await this.userModel.findOne({
            email: email
        });
        if (existsUser) {
            const useProfile = this.usersHelper.mapToUserProfile(existsUser);
            const token = this.authService.generateToken({
                userId: existsUser._id,
                role: existsUser.role
            });
            const refreshToken = this.authService.generateRefreshToken({
                userId: existsUser._id,
                role: existsUser.role
            });
            return {
                user: useProfile,
                token: token,
                refreshToken: refreshToken,
            }
        }
        else {
            const newUser = await this.userModel.create({
                ...fetchAccount,
                grade: 0, xp: 0,
                level: 0, score: 0,
                rank: Rank.None, role: Role.Member,
                loginCount: 0, streak: 0,
                lastActive: new Date()
            });
            await this.progressesService.createUserProgress({
                userId: newUser._id,
                books: []
            });
            const userProfile = this.usersHelper.mapToUserProfile(newUser);
            const token = this.authService.generateToken({
                userId: newUser._id,
                role: newUser.role
            });
            const refreshToken = this.authService.generateRefreshToken({
                userId: newUser._id,
                role: newUser.role,
            });
            return {
                user: userProfile,
                token: token,
                refreshToken: refreshToken
            }
        }
    }


    public googleRedirect(req: any): any {
        if (!req.user) {
            const errorMessage = 'No user from google'
            return errorMessage
        }
        return {
            message: 'User information from google',
            user: req.user
        }
    }



    public async googleLoginHandle(accessToken: string): Promise<UserLogin> {
        try {
            const {
                email,
                picture: avatar,
                given_name: givenName,
                family_name: familyName,
                name: displayName,
            } = await this.googleService.getUserData(accessToken);

            if (!email) {
                throw new BadRequestException('Invalid accessToken');
            }
            else {
                return this.getUserProfile({
                    facebookId: "-1",
                    email: email,
                    givenName: givenName,
                    familyName: familyName,
                    displayName: displayName,
                    avatar: avatar
                });
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }


    public async facebookLoginHandle(accessToken: string): Promise<UserLogin> {
        const facebookProfile = await this.facebookService.getUserData(accessToken);

        if (!facebookProfile) {
            throw new BadRequestException('This account not exists.');
        }
        else {
            return this.getUserProfile({
                facebookId: facebookProfile.id,
                email: facebookProfile.email,
                givenName: facebookProfile.first_name,
                familyName: facebookProfile.last_name,
                displayName: facebookProfile.name,
                avatar: facebookProfile.picture.data.url
            });
        }
    }


    public async queryMe(userId: Types.ObjectId | string): Promise<UserProfile> {
        try {
            const user = await this.userModel.findById(userId);
            if (user) {
                return this.usersHelper.mapToUserProfile(user);
            }
        } catch (error) {
            throw new InternalServerErrorException
        }
    }

    public async updateUserProfile(userId: Types.ObjectId | string, data: UpdateUserDto): Promise<UserProfile> {
        try {
            const updatedUser = await this.userModel.findByIdAndUpdate(
                userId,
                {...data},
                { new: true }
            );
            return this.usersHelper.mapToUserProfile(updatedUser);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

}