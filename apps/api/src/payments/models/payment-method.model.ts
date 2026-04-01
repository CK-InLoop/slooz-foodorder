import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaymentMethodModel {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  type: string;

  @Field()
  provider: string;

  @Field()
  last4: string;

  @Field()
  isDefault: boolean;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
