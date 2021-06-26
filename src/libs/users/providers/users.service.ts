import {
    BadRequestException,
    Inject,
    Injectable,
    InternalServerErrorException,
    UnauthorizedException,
    forwardRef,
    NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User, UserDocument } from "@entities/user.entity";
import { AuthenticationService } from '@authentication/authentication.service';
import { GoogleService } from './google.service';
import { ProgressesService } from "@libs/progresses/progresses.service";
import { UsersHelper } from '@helpers/users.helper';
import { Rank, Role } from '@utils/enums';
import { UserProfile, UserLogin, FetchAccountInfo, UpdateUserDto, UpdateUserStatusDto, SaveLessonDto } from "@dto/user";
import { FacebookService } from "./facebook.service";
import { JwtPayLoad } from "@utils/types";
import { AnswerResult } from "@dto/lesson";
import { WorkInfo } from "@dto/works";
import { LeaderBoardsService } from "@libs/leaderBoards/leaderBoards.service";
import { BooksService } from "@libs/books/providers/books.service";
import { WorksService } from "@libs/works/works.service";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly usersHelper: UsersHelper,
        private authService: AuthenticationService,
        private googleService: GoogleService,
        private facebookService: FacebookService,
        private progressesService: ProgressesService,
        private booksService: BooksService,
        private worksService: WorksService,
        @Inject(forwardRef(() => LeaderBoardsService)) private leaderBoardsService: LeaderBoardsService,
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
                { ...data },
                { new: true }
            );
            return this.usersHelper.mapToUserProfile(updatedUser);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async updateUserStatus(input: UpdateUserStatusDto): Promise<void> {
        try {
            const {
                user,
                workInfo,
                isFinishLevel,
                point
            } = input;

            let streak = user.streak;
            let loginCount = user.loginCount;
            const xp = user.xp;

            const newActive = workInfo.timeStart;
            const lastActive = user.lastActive;

            const newActiveDay = Number(newActive.toLocaleDateString().split("/")[1]);
            const lastActiveDay = Number(lastActive.toLocaleDateString().split("/")[1]);
            const checker = newActiveDay - lastActiveDay;

            if (checker === 1) {
                streak++;
                loginCount++;
            }
            else if (checker > 1) {
                streak = 0;
                loginCount++;
            }
            else if (checker === 0) {
                if (streak === 0 && loginCount === 0) {
                    streak++;
                    loginCount++;
                }
            }

            if (isFinishLevel) {
                await this.userModel.updateOne(
                    { _id: user._id },
                    {
                        streak: streak,
                        lastActive: workInfo.timeStart,
                        loginCount: loginCount,
                        level: user.level + 1,
                        score: user.score + 1,
                        xp: xp + point
                    }
                )
            }
            else {
                await this.userModel.updateOne(
                    { _id: user._id },
                    {
                        streak: streak,
                        lastActive: workInfo.timeStart,
                        loginCount: loginCount,
                        score: user.score + 1,
                        xp: xp + point
                    }
                )
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    public async saveUserLesson(userCtx: JwtPayLoad, input: SaveLessonDto): Promise<string> {
        const userProfile = await this.userModel.findById(userCtx.userId);
        if (!userProfile) {
            throw new UnauthorizedException('Not authorized');
        }
        const lessonResult: AnswerResult[] = input.results.map(result => ({...result, status: false}));
        const {
            doneQuestions,
            timeEnd,
            timeStart,
            bookId,
            unitId,
            levelIndex,
            lessonIndex
        } = input;
        const userWork: WorkInfo = {
            doneQuestions: doneQuestions,
            timeStart: new Date(timeStart),
            timeEnd: new Date(timeEnd)
        }

        const lessonTree = await this.booksService.getLessonTree({
            bookId: bookId,
            unitId: unitId,
            levelIndex: levelIndex,
            lessonIndex: lessonIndex
        });
        if (!lessonTree) {
            throw new NotFoundException(`Can't find lessonTree with ${input}`);
        }
        const saveUserProgressPromise = this.progressesService.saveUserProgress(userCtx.userId, lessonTree, userWork);
        const saveUserWorkPromise = this.worksService.saveUserWork(userProfile, lessonTree, userWork, lessonResult);
        
        let isPassedLevel: boolean = false;
        let point: number = 0;
        await Promise.all([saveUserProgressPromise, saveUserWorkPromise])
            .then(([promiseOneResult, promiseTwoResult]) => {
                isPassedLevel = promiseOneResult;
                point = promiseTwoResult;
            })
            .catch(error => {
                throw new InternalServerErrorException(error);
            })
        const updateUserStatusPromise = this.updateUserStatus({
            user: userProfile,
            workInfo: userWork,
            isFinishLevel: isPassedLevel,
            point: point
        });
        const updateUserPointPromise = this.leaderBoardsService.updateUserPointDto(userProfile, point);
        await Promise.all([updateUserStatusPromise, updateUserPointPromise])
            .catch(error => {
                throw new InternalServerErrorException(error);
            });
        return "save user work";
    }
}