import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MenuItemModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field()
  price: number;

  @Field()
  isAvailable: boolean;
}
