import { Country } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RestaurantModel } from './models/restaurant.model';
export declare class RestaurantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(country: Country): Promise<RestaurantModel[]>;
    findOne(id: string, country: Country): Promise<RestaurantModel | null>;
    private toRestaurantModel;
    private toMenuItemModel;
}
