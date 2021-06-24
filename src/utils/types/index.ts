import { Role } from '@utils/enums';

export type JwtPayLoad = {
    userId: string;
    role: Role;
}