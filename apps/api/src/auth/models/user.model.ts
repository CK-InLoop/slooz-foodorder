import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Country, Role } from '@prisma/client';

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => Role)
  role: Role;

  @Field(() => Country)
  country: Country;
}
