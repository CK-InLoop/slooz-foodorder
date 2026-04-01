import { Country, Role } from '@prisma/client';
import { Permission } from './permissions';
export interface AuthUser {
    sub: string;
    email: string;
    role: Role;
    country: Country;
    permissions: Permission[];
}
