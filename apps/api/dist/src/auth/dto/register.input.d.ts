import { Country } from '@prisma/client';
export declare class RegisterInput {
    email: string;
    password: string;
    name: string;
    country: Country;
}
