import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

@InputType()
export class AddPaymentMethodInput {
  @Field()
  @IsString()
  userId: string;

  @Field()
  @IsString()
  type: string;

  @Field()
  @IsString()
  provider: string;

  @Field()
  @Length(4, 4)
  last4: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
