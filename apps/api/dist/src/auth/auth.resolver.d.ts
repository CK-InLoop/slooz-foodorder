import type { AuthUser } from '../common/auth-user.interface';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { AuthPayloadModel } from './models/auth-payload.model';
import { UserModel } from './models/user.model';
export declare class AuthResolver {
    private readonly authService;
    constructor(authService: AuthService);
    register(input: RegisterInput): Promise<AuthPayloadModel>;
    login(input: LoginInput): Promise<AuthPayloadModel>;
    me(user: AuthUser): Promise<UserModel | null>;
}
