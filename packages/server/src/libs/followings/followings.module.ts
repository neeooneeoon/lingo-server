import { Following, FollowingSchema } from '@entities/following.entity';
import { UsersModule } from '@libs/users';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowingsController } from './controllers/followings.controller';
import { FollowingsService } from './providers/followings.service';
import { Tag, TagSchema } from '@entities/tag.entity';
import { TagsController } from './controllers/tags.controller';
import { TagsService } from './providers/tags.service';
import { FollowingsHelper } from '@helpers/followings.helper';
import { CacheModule } from '@cache';
import { FollowersService } from './providers/followers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Following.name, schema: FollowingSchema },
      { name: Tag.name, schema: TagSchema },
    ]),
    forwardRef(() => UsersModule),
    CacheModule,
  ],
  providers: [
    FollowingsService,
    TagsService,
    FollowingsHelper,
    FollowersService,
  ],
  controllers: [FollowingsController, TagsController],
  exports: [FollowingsService, TagsService, FollowersService],
})
export class FollowingsModule {}
