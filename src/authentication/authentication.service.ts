import { Injectable } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { Role } from '@utils/enums';
import { ConfigsService } from '@configs/configs.service';
interface JwtPayload {
    userId: string;
    role: Role
}

@Injectable()
export class AuthenticationService {
    constructor(private jwtService: JwtService, private configsService: ConfigsService) { }

    generateToken(payload: JwtPayload) {
        return this.jwtService.sign({user: payload}, { secret: this.configsService.get('TOKEN_SECRET'), expiresIn: 3600 });
    }

    generateRefreshToken(payload: JwtPayload) {
        return this.jwtService.sign({user: payload}, { secret: this.configsService.get('TOKEN_SECRET'), expiresIn: 864000 });
    }
}