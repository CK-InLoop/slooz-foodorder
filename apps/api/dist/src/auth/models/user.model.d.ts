import { Country, Role } from '@prisma/client';
export declare class UserModel {
    id: string;
    email: string;
    name: string;
    role: Role;
    country: Country;
}
