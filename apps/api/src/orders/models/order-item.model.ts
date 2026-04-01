import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrderItemModel {
  @Field(() => ID)
  id: string;

  @Field()
  menuItemId: string;

  @Field()
  menuItemName: string;

  @Field(() => Int)
  quantity: number;

  @Field()
  unitPrice: number;

  @Field()
  lineTotal: number;
}
