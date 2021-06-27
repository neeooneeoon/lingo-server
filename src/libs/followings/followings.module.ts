import { Following, FollowingSchema } from "@entities/following.entity";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FollowingsService } from "./followings.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Following.name, schema: FollowingSchema}
        ]),
    ],
    providers: [
        FollowingsService,
    ],
    exports: [
        FollowingsService,
    ]
})

export class FollowingsModule { };