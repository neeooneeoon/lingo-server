import { AuthenticationModule } from "@authentication/authentication.module";
import { User, UserSchema } from "@entities/user.entity";
import { UsersHelper } from "@helpers/users.helper";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { ManagementsModule } from "./managements/managements.module";

@Module({
    imports:[
        MongooseModule.forFeature([
            {name: User.name, schema: UserSchema}
        ]),
        AuthenticationModule,
        ManagementsModule
    ],
    controllers: [AdminController],
    providers: [
        AdminService,
        UsersHelper
    ],
})
export class AdminModules {  }