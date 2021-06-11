import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {  } from '@utils/'

interface GeneratingInput {
    _id: string;
    role: 
}

@Injectable()
export class AuthenticationService {
    constructor(private jwtService: JwtService) {}

    generateToken ()
}