import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigsService } from '@configs/configs.service';
import { JwtPayLoad } from '@utils/types';

@Injectable()
export class AuthenticationService {
  constructor(
    private jwtService: JwtService,
    private configsService: ConfigsService,
  ) {}

  generateToken(payload: JwtPayLoad) {
    return this.jwtService.sign(
      { user: payload },
      { secret: this.configsService.get('TOKEN_SECRET'), expiresIn: 864000 },
    );
  }

  generateRefreshToken(payload: JwtPayLoad) {
    return this.jwtService.sign(
      { user: payload },
      { secret: this.configsService.get('TOKEN_SECRET'), expiresIn: 864000 },
    );
  }
}
