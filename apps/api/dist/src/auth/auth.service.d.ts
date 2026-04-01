import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { AuthPayloadModel } from './models/auth-payload.model';
import { UserModel } from './models/user.model';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(input: RegisterInput): Promise<AuthPayloadModel>;
    login(input: LoginInput): Promise<AuthPayloadModel>;
    me(userId: string): Promise<UserModel | null>;
    private createAuthPayload;
    private toUserModel;
}
