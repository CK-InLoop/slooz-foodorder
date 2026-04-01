import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import type { AuthUser } from '../common/auth-user.interface';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { AuthPayloadModel } from './models/auth-payload.model';
import { UserModel } from './models/user.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayloadModel)
  register(@Args('input') input: RegisterInput): Promise<AuthPayloadModel> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthPayloadModel)
  login(@Args('input') input: LoginInput): Promise<AuthPayloadModel> {
    return this.authService.login(input);
  }

  @Query(() => UserModel, { nullable: true })
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: AuthUser): Promise<UserModel | null> {
    return this.authService.me(user.sub);
  }
}
