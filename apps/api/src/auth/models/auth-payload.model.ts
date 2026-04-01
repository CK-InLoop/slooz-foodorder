import { Field, ObjectType } from '@nestjs/graphql';
import { UserModel } from './user.model';

@ObjectType()
export class AuthPayloadModel {
  @Field()
  accessToken: string;

  @Field(() => [String])
  permissions: string[];

  @Field(() => UserModel)
  user: UserModel;
}
