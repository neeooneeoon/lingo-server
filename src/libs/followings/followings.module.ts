import { Following, FollowingSchema } from "@entities/following.entity";
import { UsersModule } from "@libs/users";
import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FollowingsController } from "./followings.controller";
import { FollowingsService } from "./followings.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Following.name, schema: FollowingSchema}
        ]),
        forwardRef(() => UsersModule)
    ],
    providers: [
        FollowingsService,
    ],
    controllers: [
        FollowingsController
    ],
    exports: [
        FollowingsService,
    ]
})

export class FollowingsModule { };