import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PaymentStatus } from '@prisma/client';

@ObjectType()
export class PaymentModel {
  @Field(() => ID)
  id: string;

  @Field()
  orderId: string;

  @Field({ nullable: true })
  paymentMethodId?: string | null;

  @Field()
  amount: number;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field({ nullable: true })
  processedAt?: Date | null;
}
