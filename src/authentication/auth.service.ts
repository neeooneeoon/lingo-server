import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService
    ) {}
    validatePassword(requestPassword: string, hashPassword: string): Promise<boolean> {
        return bcrypt.compare(requestPassword, hashPassword)
    }
    generateToken (user: any): string {
        const payload = { user: user }
        return this.jwtService.sign( payload, { secret: process.env.TOKEN_KEY } )
    }
}
