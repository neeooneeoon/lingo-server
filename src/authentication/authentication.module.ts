import { LocalStrategy } from './strategy/local.strategy';
import { LocalAuthGuard } from './guard/localAuth.guard';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { FacebookStrategy } from './strategy/facebook.strategy';
import { JwtAuthGuard } from './guard/jwtAuth.guard';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.TOKEN_SECRET,
      signOptions: { expiresIn: '30days' },
    }),
    PassportModule.register({ session: true }),
  ],
  providers: [
    AuthenticationService,
    JwtAuthGuard,
    JwtStrategy,
    LocalAuthGuard,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
  exports: [
    AuthenticationService,
    JwtAuthGuard,
    JwtStrategy,
    LocalAuthGuard,
    LocalStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
})
export class AuthenticationModule {}
