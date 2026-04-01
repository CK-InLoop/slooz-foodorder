import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import * as bcrypt from 'bcrypt';
import { Role, User } from '@prisma/client';
import { AuthPayloadModel } from './models/auth-payload.model';
import { UserModel } from './models/user.model';
import { ROLE_PERMISSIONS } from '../common/permissions';
import { AuthUser } from '../common/auth-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthPayloadModel> {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email is already registered.');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        country: input.country,
        role: Role.MEMBER,
      },
    });

    return this.createAuthPayload(user);
  }

  async login(input: LoginInput): Promise<AuthPayloadModel> {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.createAuthPayload(user);
  }

  async me(userId: string): Promise<UserModel | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return null;
    }

    return this.toUserModel(user);
  }

  private createAuthPayload(user: User): AuthPayloadModel {
    const permissions = ROLE_PERMISSIONS[user.role];

    const payload: AuthUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
      country: user.country,
      permissions,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      permissions,
      user: this.toUserModel(user),
    };
  }

  private toUserModel(user: User): UserModel {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      country: user.country,
    };
  }
}
