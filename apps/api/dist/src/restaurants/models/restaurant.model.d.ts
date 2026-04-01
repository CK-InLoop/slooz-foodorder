import { Country } from '@prisma/client';
import { MenuItemModel } from './menu-item.model';
export declare class RestaurantModel {
    id: string;
    name: string;
    description?: string | null;
    city: string;
    country: Country;
    menuItems: MenuItemModel[];
}
