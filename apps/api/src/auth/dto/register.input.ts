import { Field, InputType } from '@nestjs/graphql';
import { Country } from '@prisma/client';
import { IsEmail, IsEnum, Length } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(8, 64)
  password: string;

  @Field()
  @Length(2, 80)
  name: string;

  @Field(() => Country)
  @IsEnum(Country)
  country: Country;
}
