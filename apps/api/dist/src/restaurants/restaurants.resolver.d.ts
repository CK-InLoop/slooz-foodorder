import type { AuthUser } from '../common/auth-user.interface';
import { RestaurantModel } from './models/restaurant.model';
import { RestaurantsService } from './restaurants.service';
export declare class RestaurantsResolver {
    private readonly restaurantsService;
    constructor(restaurantsService: RestaurantsService);
    restaurants(user: AuthUser): Promise<RestaurantModel[]>;
    restaurant(id: string, user: AuthUser): Promise<RestaurantModel | null>;
}
