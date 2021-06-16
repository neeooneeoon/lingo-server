import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from '@authentication';
import { User, UserSchema } from '@entities/user.entity';
import { UsersService } from '@providers/users.service';
import { GoogleService } from '@providers/google.service';
import { ProgressesService } from '@providers/progresses.service';
import { GoogleController } from './controllers/google.controller';
import { UserController } from './controllers/users.controller';
import { UsersHelper } from '@helpers/users.helper';

@Module({
    imports: [
        MongooseModule.forFeature(
            [
                {
                    name: User.name,
                    schema: UserSchema
                }
            ]
        ),
        AuthenticationModule,
    ],
    controllers: [
        UserController,
        GoogleController,
    ],
    providers: [
        UsersService,
        UsersHelper,
        GoogleService,
        ProgressesService,
    ]
})
export class UsersModule { };