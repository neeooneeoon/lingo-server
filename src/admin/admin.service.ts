import { User, UserDocument } from "@entities/user.entity";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Rank, Role } from "@utils/enums";
import { Model } from "mongoose";
import * as bcrypt from 'bcrypt';
import { UsersHelper } from "@helpers/users.helper";
import { AuthenticationService } from "@authentication/authentication.service";

@Injectable()
export class AdminService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly usersHelper: UsersHelper,
        private authService: AuthenticationService,

    ) { }

    async login(typedEmail: string, typedPassword: string): Promise<any> {
        if (typedEmail !== "admin@lingo.com" || typedPassword !== "adminadmin") {
            throw new BadRequestException('Error')
        }
        const email = "admin@lingo.com";
        const saltOrRounds = 10;
        const hash = await bcrypt.hash("adminadmin", saltOrRounds)
        try {
            const existsAdmin = await this.userModel.find({ role: Role.Admin });
            if (!existsAdmin || existsAdmin.length == 0) {
                const admin = await this.userModel.create({
                    facebookId: '-1',
                    email: email,
                    givenName: 'Admin',
                    familyName: 'Admin',
                    displayName: 'Admin',
                    avatar: `https://i.pinimg.com/736x/5f/40/6a/5f406ab25e8942cbe0da6485afd26b71.jpg`,
                    grade: 0, xp: 0,
                    level: 0, score: 0,
                    rank: Rank.None,
                    role: Role.Admin,
                    loginCount: 0, streak: 0,
                    lastActive: new Date(),
                    password: hash
                });
                const token = this.authService.generateToken({
                    userId: admin._id,
                    role: admin.role
                });
                const adminProfile = this.usersHelper.mapToUserProfile(admin);
                return {
                    user: adminProfile,
                    token: token
                }
            }
            else {
                const verifyAdmin = existsAdmin.find(item => item.email == 'admin@lingo.com');
                if (!verifyAdmin) {
                    throw new BadRequestException('Error')
                }
                const isMatch = await bcrypt.compare(typedPassword, verifyAdmin.password);
                if (isMatch) {
                    throw new BadRequestException('Error');
                }
                const token = this.authService.generateToken({
                    userId: verifyAdmin._id,
                    role: verifyAdmin.role
                });
                const adminProfile = this.usersHelper.mapToUserProfile(verifyAdmin);
                return {
                    user: adminProfile,
                    token: token
                }
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

}