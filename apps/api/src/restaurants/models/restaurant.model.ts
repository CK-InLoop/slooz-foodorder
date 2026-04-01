import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Country } from '@prisma/client';
import { MenuItemModel } from './menu-item.model';

@ObjectType()
export class RestaurantModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string | null;

  @Field()
  city: string;

  @Field(() => Country)
  country: Country;

  @Field(() => [MenuItemModel])
  menuItems: MenuItemModel[];
}
