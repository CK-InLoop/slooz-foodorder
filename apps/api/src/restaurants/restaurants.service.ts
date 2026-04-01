import { Injectable } from '@nestjs/common';
import { Country, MenuItem, Restaurant } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MenuItemModel } from './models/menu-item.model';
import { RestaurantModel } from './models/restaurant.model';

type RestaurantWithMenu = Restaurant & { menuItems: MenuItem[] };

@Injectable()
export class RestaurantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(country: Country): Promise<RestaurantModel[]> {
    const restaurants = await this.prisma.restaurant.findMany({
      where: { country },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return restaurants.map((restaurant) => this.toRestaurantModel(restaurant));
  }

  async findOne(id: string, country: Country): Promise<RestaurantModel | null> {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id, country },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!restaurant) {
      return null;
    }

    return this.toRestaurantModel(restaurant);
  }

  private toRestaurantModel(restaurant: RestaurantWithMenu): RestaurantModel {
    return {
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      city: restaurant.city,
      country: restaurant.country,
      menuItems: restaurant.menuItems.map((item) => this.toMenuItemModel(item)),
    };
  }

  private toMenuItemModel(item: MenuItem): MenuItemModel {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      isAvailable: item.isAvailable,
    };
  }
}
