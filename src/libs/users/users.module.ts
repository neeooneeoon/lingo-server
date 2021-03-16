import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { GoogleAuthentication } from './googleAuth.controller';
import { GoogleStrategy } from 'src/authentication/google.strategy';
import { FacebookStrategy } from 'src//authentication/facebook.strategy';
import { FacebookAuthenticationController } from './facebookAuth.controller';
import { UserHelper } from 'src/helper/user.helper';
import { ProgressesModule } from 'src/libs/progresses/progresses.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema}
    ]),
    AuthenticationModule,
    GoogleStrategy,
    FacebookStrategy,
    ProgressesModule,
  ],
  controllers: [UsersController, GoogleAuthentication, FacebookAuthenticationController],
  providers: [UsersService, UserHelper]
})
export class UsersModule {}
