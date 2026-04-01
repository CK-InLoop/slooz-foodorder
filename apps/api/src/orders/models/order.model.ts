import { Field, ID, ObjectType } from '@nestjs/graphql';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrderItemModel } from './order-item.model';

@ObjectType()
export class OrderModel {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  restaurantId: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => PaymentStatus)
  paymentStatus: PaymentStatus;

  @Field()
  subtotal: number;

  @Field()
  tax: number;

  @Field()
  total: number;

  @Field({ nullable: true })
  notes?: string | null;

  @Field()
  createdAt: Date;

  @Field(() => [OrderItemModel])
  items: OrderItemModel[];
}
