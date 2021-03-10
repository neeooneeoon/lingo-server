import { AuthService } from './auth.service';
import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { LocalAuthGuard } from './local-auth.guard';
import { LocalStrategy } from './local.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.TOKEN_KEY,
      signOptions: { expiresIn: '30days' },
    }),
    PassportModule.register({
      session: true,
    }),
  ],
  providers: [
    AuthService,
    JwtAuthGuard,
    JwtStrategy,
    LocalAuthGuard,
    LocalStrategy,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    JwtStrategy,
    LocalAuthGuard,
    LocalStrategy,
  ],
})
export class AuthenticationModule {}
