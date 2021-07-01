import { User, UserDocument } from "@entities/user.entity";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Role } from "@utils/enums";
import { Model } from "mongoose";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {

    constructor (
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }

    private async createAdmin(): Promise<any> {
        const email = "admin@lingo.com";
        const password = "adminadmin";
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(password, saltOrRounds)
        try {
            const existsAdmin = await this.userModel.findOne({ role: Role.Admin });
            if (existsAdmin) {
                await this.userModel.create({
                    email: email,
                    password: hash
                })
            }
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

}