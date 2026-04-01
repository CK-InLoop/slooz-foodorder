import { PrismaClient } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcryptjs.hash('Password@123', 10);

  // ──── Users ────
  const users = [
    { email: 'admin.india@slooz.dev', name: 'Admin India', role: 'ADMIN' as const, country: 'INDIA' as const },
    { email: 'manager.india@slooz.dev', name: 'Manager India', role: 'MANAGER' as const, country: 'INDIA' as const },
    { email: 'member.india@slooz.dev', name: 'Member India', role: 'MEMBER' as const, country: 'INDIA' as const },
    { email: 'admin.america@slooz.dev', name: 'Admin America', role: 'ADMIN' as const, country: 'AMERICA' as const },
    { email: 'manager.america@slooz.dev', name: 'Manager America', role: 'MANAGER' as const, country: 'AMERICA' as const },
    { email: 'member.america@slooz.dev', name: 'Member America', role: 'MEMBER' as const, country: 'AMERICA' as const },
  ];

  const createdUsers: Record<string, string> = {};
  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      createdUsers[u.email] = existing.id;
      console.log(`  ✓ User ${u.email} already exists`);
    } else {
      const user = await prisma.user.create({ data: { ...u, passwordHash } });
      createdUsers[u.email] = user.id;
      console.log(`  + Created user ${u.email}`);
    }
  }

  // ──── Restaurants ────
  const restaurants = [
    { name: 'Tandoori Palace', description: 'Authentic North Indian cuisine', city: 'Mumbai', country: 'INDIA' as const },
    { name: 'Dosa Corner', description: 'Best South Indian dishes', city: 'Bangalore', country: 'INDIA' as const },
    { name: 'Burger Barn', description: 'Classic American burgers', city: 'New York', country: 'AMERICA' as const },
    { name: 'Pizza Planet', description: 'Wood-fired pizzas and pastas', city: 'Chicago', country: 'AMERICA' as const },
  ];

  const createdRestaurants: Record<string, string> = {};
  for (const r of restaurants) {
    const existing = await prisma.restaurant.findFirst({
      where: { name: r.name, country: r.country },
    });
    if (existing) {
      createdRestaurants[r.name] = existing.id;
      console.log(`  ✓ Restaurant ${r.name} already exists`);
    } else {
      const rest = await prisma.restaurant.create({ data: r });
      createdRestaurants[r.name] = rest.id;
      console.log(`  + Created restaurant ${r.name}`);
    }
  }

  // ──── Menu Items ────
  const menuItems = [
    { restaurantName: 'Tandoori Palace', name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', price: 350 },
    { restaurantName: 'Tandoori Palace', name: 'Naan Basket', description: 'Assorted freshly baked naans', price: 120 },
    { restaurantName: 'Dosa Corner', name: 'Masala Dosa', description: 'Crispy dosa with potato filling', price: 180 },
    { restaurantName: 'Dosa Corner', name: 'Filter Coffee', description: 'Traditional South Indian coffee', price: 60 },
    { restaurantName: 'Burger Barn', name: 'Classic Cheeseburger', description: 'Angus beef with cheddar', price: 12.99 },
    { restaurantName: 'Burger Barn', name: 'Loaded Fries', description: 'Fries with cheese and bacon', price: 8.99 },
    { restaurantName: 'Pizza Planet', name: 'Margherita Pizza', description: 'Fresh mozzarella and basil', price: 14.99 },
    { restaurantName: 'Pizza Planet', name: 'Garlic Knots', description: 'Buttery garlic bread knots', price: 6.99 },
  ];

  for (const mi of menuItems) {
    const restaurantId = createdRestaurants[mi.restaurantName];
    const existing = await prisma.menuItem.findFirst({
      where: { restaurantId, name: mi.name },
    });
    if (existing) {
      console.log(`  ✓ Menu item ${mi.name} already exists`);
    } else {
      await prisma.menuItem.create({
        data: {
          restaurantId,
          name: mi.name,
          description: mi.description,
          price: mi.price,
        },
      });
      console.log(`  + Created menu item ${mi.name}`);
    }
  }

  // ──── Payment Methods for Admins ────
  const adminEmails = ['admin.india@slooz.dev', 'admin.america@slooz.dev'];
  for (const email of adminEmails) {
    const userId = createdUsers[email];
    const existing = await prisma.paymentMethod.findFirst({
      where: { userId, provider: 'VISA' },
    });
    if (existing) {
      console.log(`  ✓ Payment method for ${email} already exists`);
    } else {
      await prisma.paymentMethod.create({
        data: {
          userId,
          type: 'CREDIT_CARD',
          provider: 'VISA',
          last4: '4242',
          isDefault: true,
        },
      });
      console.log(`  + Created payment method for ${email}`);
    }
  }

  console.log('\n✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
