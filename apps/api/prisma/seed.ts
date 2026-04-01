import { PrismaClient, Country, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function upsertUser(
  email: string,
  name: string,
  role: Role,
  country: Country,
  passwordHash: string,
) {
  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      country,
      passwordHash,
    },
    create: {
      email,
      name,
      role,
      country,
      passwordHash,
    },
  });
}

async function upsertRestaurant(
  name: string,
  city: string,
  country: Country,
  description: string,
) {
  return prisma.restaurant.upsert({
    where: {
      name_country: {
        name,
        country,
      },
    },
    update: {
      city,
      description,
    },
    create: {
      name,
      city,
      country,
      description,
    },
  });
}

async function seed() {
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const users = await Promise.all([
    upsertUser(
      'admin.india@slooz.dev',
      'India Admin',
      Role.ADMIN,
      Country.INDIA,
      passwordHash,
    ),
    upsertUser(
      'manager.india@slooz.dev',
      'India Manager',
      Role.MANAGER,
      Country.INDIA,
      passwordHash,
    ),
    upsertUser(
      'member.india@slooz.dev',
      'India Member',
      Role.MEMBER,
      Country.INDIA,
      passwordHash,
    ),
    upsertUser(
      'admin.america@slooz.dev',
      'America Admin',
      Role.ADMIN,
      Country.AMERICA,
      passwordHash,
    ),
    upsertUser(
      'manager.america@slooz.dev',
      'America Manager',
      Role.MANAGER,
      Country.AMERICA,
      passwordHash,
    ),
    upsertUser(
      'member.america@slooz.dev',
      'America Member',
      Role.MEMBER,
      Country.AMERICA,
      passwordHash,
    ),
  ]);

  const [indiaRestaurantOne, indiaRestaurantTwo, usaRestaurantOne, usaRestaurantTwo] =
    await Promise.all([
      upsertRestaurant(
        'Spice Route',
        'Bengaluru',
        Country.INDIA,
        'North and South Indian comfort food.',
      ),
      upsertRestaurant(
        'Coastal Curry House',
        'Mumbai',
        Country.INDIA,
        'Seafood and regional curries.',
      ),
      upsertRestaurant(
        'Big Sky Grill',
        'Austin',
        Country.AMERICA,
        'American grill and smokehouse classics.',
      ),
      upsertRestaurant(
        'Golden State Bowls',
        'San Francisco',
        Country.AMERICA,
        'Healthy bowls, wraps, and salads.',
      ),
    ]);

  const menuPayload = [
    {
      restaurantId: indiaRestaurantOne.id,
      name: 'Paneer Butter Masala',
      description: 'Creamy tomato gravy with marinated paneer.',
      price: 320,
    },
    {
      restaurantId: indiaRestaurantOne.id,
      name: 'Masala Dosa',
      description: 'Crispy dosa with potato filling.',
      price: 180,
    },
    {
      restaurantId: indiaRestaurantTwo.id,
      name: 'Malabar Prawn Curry',
      description: 'Coconut-based spicy prawn curry.',
      price: 390,
    },
    {
      restaurantId: indiaRestaurantTwo.id,
      name: 'Appam',
      description: 'Soft fermented rice pancakes.',
      price: 120,
    },
    {
      restaurantId: usaRestaurantOne.id,
      name: 'Smoked Brisket Plate',
      description: 'Slow-smoked brisket with house sides.',
      price: 24,
    },
    {
      restaurantId: usaRestaurantOne.id,
      name: 'Classic Cheeseburger',
      description: 'Angus beef patty, cheddar, and fries.',
      price: 16,
    },
    {
      restaurantId: usaRestaurantTwo.id,
      name: 'Chipotle Chicken Bowl',
      description: 'Brown rice, chicken, avocado, and salsa.',
      price: 15,
    },
    {
      restaurantId: usaRestaurantTwo.id,
      name: 'Falafel Green Wrap',
      description: 'Herb falafel with tahini and fresh greens.',
      price: 13,
    },
  ];

  for (const item of menuPayload) {
    await prisma.menuItem.upsert({
      where: {
        restaurantId_name: {
          restaurantId: item.restaurantId,
          name: item.name,
        },
      },
      update: {
        description: item.description,
        price: item.price,
        isAvailable: true,
      },
      create: {
        restaurantId: item.restaurantId,
        name: item.name,
        description: item.description,
        price: item.price,
        isAvailable: true,
      },
    });
  }

  for (const user of users.filter((u) => u.role === Role.ADMIN)) {
    await prisma.paymentMethod.upsert({
      where: {
        userId_provider_last4: {
          userId: user.id,
          provider: 'VISA',
          last4: '4242',
        },
      },
      update: {
        type: 'CARD',
        isDefault: true,
        isActive: true,
      },
      create: {
        userId: user.id,
        type: 'CARD',
        provider: 'VISA',
        last4: '4242',
        isDefault: true,
        isActive: true,
      },
    });
  }

  console.log('Seed complete. Demo password for all users: Password@123');
}

seed()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
