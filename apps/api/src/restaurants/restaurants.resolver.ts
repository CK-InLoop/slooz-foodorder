import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { AuthUser } from '../common/auth-user.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RestaurantModel } from './models/restaurant.model';
import { RestaurantsService } from './restaurants.service';

@Resolver(() => RestaurantModel)
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class RestaurantsResolver {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Query(() => [RestaurantModel])
  @Permissions('view:restaurants')
  restaurants(@CurrentUser() user: AuthUser): Promise<RestaurantModel[]> {
    return this.restaurantsService.findAll(user.country);
  }

  @Query(() => RestaurantModel, { nullable: true })
  @Permissions('view:restaurants')
  restaurant(
    @Args('id', { type: () => String }) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<RestaurantModel | null> {
    return this.restaurantsService.findOne(id, user.country);
  }
}
