import { Role } from '@utils/enums';

export class JwtPayLoad {
    userId: string;
    role: Role;
}

export class DistractedChoice {
    _id: string;
    active: boolean;
}