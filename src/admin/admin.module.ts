import { User, UserSchema } from "@entities/user.entity";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    imports:[
        MongooseModule.forFeature([
            {name: User.name, schema: UserSchema}
        ])
    ],
    providers: []
})
export class AdminModules {  }