import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@entities/user.entity';
import { GoogleController } from './controllers/google.controller';
import { UserController } from './controllers/users.controller';
import { UsersService } from '@providers/users.service';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: User.name,
                    schema: UserSchema
                }
            ]
        )
    ],
    controllers: [
        UserController,
        GoogleController
    ],
    providers: [UsersService]
})
export class UsersModule { };