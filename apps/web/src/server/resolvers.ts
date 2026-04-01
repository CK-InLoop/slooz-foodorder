import { prisma } from './prisma';
import {
  AuthUser,
  ROLE_PERMISSIONS,
  comparePassword,
  extractUser,
  hashPassword,
  requireAuth,
  requirePermission,
  signToken,
} from './auth';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getUser(context: { req: Request }): AuthUser | null {
  return extractUser(context.req);
}

function authed(context: { req: Request }): AuthUser {
  return requireAuth(getUser(context));
}

/* ------------------------------------------------------------------ */
/*  Resolvers                                                          */
/* ------------------------------------------------------------------ */

export const resolvers = {
  Query: {
    /* ---- Auth ---- */
    me: async (_: unknown, __: unknown, context: { req: Request }) => {
      const user = getUser(context);
      if (!user) return null;
      const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
      if (!dbUser) return null;
      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        country: dbUser.country,
      };
    },

    /* ---- Restaurants ---- */
    restaurants: async (_: unknown, __: unknown, context: { req: Request }) => {
      const user = authed(context);
      requirePermission(user, 'view:restaurants');

      const restaurants = await prisma.restaurant.findMany({
        where: { country: user.country },
        include: {
          menuItems: {
            where: { isAvailable: true },
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      });

      return restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        city: r.city,
        country: r.country,
        menuItems: r.menuItems.map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          price: m.price,
          isAvailable: m.isAvailable,
        })),
      }));
    },

    restaurant: async (
      _: unknown,
      { id }: { id: string },
      context: { req: Request },
    ) => {
      const user = authed(context);
      requirePermission(user, 'view:restaurants');

      const restaurant = await prisma.restaurant.findFirst({
        where: { id, country: user.country },
        include: {
          menuItems: {
            where: { isAvailable: true },
            orderBy: { name: 'asc' },
          },
        },
      });

      if (!restaurant) return null;

      return {
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        city: restaurant.city,
        country: restaurant.country,
        menuItems: restaurant.menuItems.map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          price: m.price,
          isAvailable: m.isAvailable,
        })),
      };
    },

    /* ---- Orders ---- */
    orders: async (_: unknown, __: unknown, context: { req: Request }) => {
      const user = authed(context);
      requirePermission(user, 'view:orders');

      const where: Record<string, unknown> = {
        restaurant: { country: user.country },
      };
      if (user.role === 'MEMBER') {
        where.userId = user.sub;
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: { include: { menuItem: true }, orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return orders.map(toOrderModel);
    },

    /* ---- Payment Methods ---- */
    paymentMethods: async (
      _: unknown,
      { userId }: { userId?: string },
      context: { req: Request },
    ) => {
      const user = authed(context);
      requirePermission(user, 'manage:payment-methods');
      if (user.role !== 'ADMIN') throw new Error('Only admins can manage payment methods.');

      const scopedUserId = await resolveCountryScopedUser(user, userId);

      const methods = await prisma.paymentMethod.findMany({
        where: { userId: scopedUserId },
        orderBy: { createdAt: 'desc' },
      });

      return methods.map(toPaymentMethodModel);
    },
  },

  Mutation: {
    /* ---- Auth ---- */
    register: async (
      _: unknown,
      { input }: { input: { email: string; password: string; name: string; country: string } },
    ) => {
      const email = input.email.toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new Error('Email is already registered.');

      const passwordHash = await hashPassword(input.password);
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: input.name,
          country: input.country as 'INDIA' | 'AMERICA',
          role: 'MEMBER',
        },
      });

      return createAuthPayload(user);
    },

    login: async (
      _: unknown,
      { input }: { input: { email: string; password: string } },
    ) => {
      const email = input.email.toLowerCase();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('Invalid credentials.');

      const valid = await comparePassword(input.password, user.passwordHash);
      if (!valid) throw new Error('Invalid credentials.');

      return createAuthPayload(user);
    },

    /* ---- Orders ---- */
    createOrder: async (
      _: unknown,
      { input }: { input: { restaurantId: string; items: { menuItemId: string; quantity: number }[]; notes?: string } },
      context: { req: Request },
    ) => {
      const user = authed(context);
      requirePermission(user, 'create:order');

      if (!input.items.length) throw new Error('At least one item is required.');

      const restaurant = await prisma.restaurant.findFirst({
        where: { id: input.restaurantId, country: user.country },
      });
      if (!restaurant) throw new Error('Restaurant is not available in your country.');

      const uniqueIds = [...new Set(input.items.map((i) => i.menuItemId))];
      const menuItems = await prisma.menuItem.findMany({
        where: { id: { in: uniqueIds }, restaurantId: restaurant.id, isAvailable: true },
      });
      if (menuItems.length !== uniqueIds.length) throw new Error('One or more menu items are invalid.');

      const menuById = new Map(menuItems.map((m) => [m.id, m]));
      let subtotal = 0;
      const orderItems = input.items.map((item) => {
        const menuItem = menuById.get(item.menuItemId)!;
        const unitPrice = menuItem.price;
        subtotal += unitPrice * item.quantity;
        return { menuItemId: item.menuItemId, quantity: item.quantity, unitPrice };
      });

      const tax = Number((subtotal * 0.05).toFixed(2));
      const total = Number((subtotal + tax).toFixed(2));

      const order = await prisma.order.create({
        data: {
          userId: user.sub,
          restaurantId: restaurant.id,
          subtotal,
          tax,
          total,
          notes: input.notes,
          items: { create: orderItems },
        },
        include: { items: { include: { menuItem: true }, orderBy: { createdAt: 'asc' } } },
      });

      return toOrderModel(order);
    },

    checkoutOrder: async (
      _: unknown,
      { orderId, paymentMethodId }: { orderId: string; paymentMethodId?: string },
      context: { req: Request },
    ) => {
      const user = authed(context);
      requirePermission(user, 'checkout:order');
      if (user.role === 'MEMBER') throw new Error('Members are not allowed to checkout.');

      const order = await prisma.order.findFirst({
        where: { id: orderId, restaurant: { country: user.country } },
      });
      if (!order) throw new Error('Order was not found in your country scope.');
      if (order.status === 'CANCELLED' || order.status === 'COMPLETED')
        throw new Error('This order cannot be checked out.');
      if (order.paymentStatus === 'PAID') throw new Error('This order is already paid.');

      if (paymentMethodId) {
        const pm = await prisma.paymentMethod.findFirst({
          where: { id: paymentMethodId, isActive: true, user: { country: user.country } },
        });
        if (!pm) throw new Error('Payment method is outside your country scope.');
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONFIRMED', paymentStatus: 'PAID' },
      });

      const existing = await prisma.payment.findUnique({ where: { orderId: order.id } });
      let payment;
      if (existing) {
        payment = await prisma.payment.update({
          where: { orderId: order.id },
          data: {
            amount: order.total,
            status: 'PAID',
            paymentMethodId: paymentMethodId ?? null,
            processedAt: new Date(),
          },
        });
      } else {
        payment = await prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.total,
            status: 'PAID',
            paymentMethodId: paymentMethodId ?? null,
            processedAt: new Date(),
          },
        });
      }

      return {
        id: payment.id,
        orderId: payment.orderId,
        paymentMethodId: payment.paymentMethodId,
        amount: payment.amount,
        status: payment.status,
        processedAt: payment.processedAt?.toISOString() ?? null,
      };
    },

    cancelOrder: async (
      _: unknown,
      { orderId }: { orderId: string },
      context: { req: Request },
    ) => {
      const user = authed(context);
      requirePermission(user, 'cancel:order');
      if (user.role === 'MEMBER') throw new Error('Members are not allowed to cancel orders.');

      const order = await prisma.order.findFirst({
        where: { id: orderId, restaurant: { country: user.country } },
        include: { items: { include: { menuItem: true }, orderBy: { createdAt: 'asc' } } },
      });
      if (!order) throw new Error('Order was not found in your country scope.');
      if (order.status === 'CANCELLED' || order.status === 'COMPLETED')
        throw new Error('This order cannot be cancelled.');

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
        include: { items: { include: { menuItem: true }, orderBy: { createdAt: 'asc' } } },
      });

      return toOrderModel(updated);
    },

    /* ---- Payment Methods ---- */
    addPaymentMethod: async (
      _: unknown,
      { input }: { input: { userId: string; type: string; provider: string; last4: string; isDefault?: boolean } },
      context: { req: Request },
    ) => {
      const user = authed(context);
      requirePermission(user, 'manage:payment-methods');
      if (user.role !== 'ADMIN') throw new Error('Only admins can manage payment methods.');

      const scopedUserId = await resolveCountryScopedUser(user, input.userId);

      if (input.isDefault) {
        await prisma.paymentMethod.updateMany({
          where: { userId: scopedUserId },
          data: { isDefault: false },
        });
      }

      const pm = await prisma.paymentMethod.create({
        data: {
          userId: scopedUserId,
          type: input.type,
          provider: input.provider,
          last4: input.last4,
          isDefault: input.isDefault ?? false,
        },
      });

      return toPaymentMethodModel(pm);
    },

    updatePaymentMethod: async (
      _: unknown,
      { input }: { input: { paymentMethodId: string; type?: string; provider?: string; last4?: string; isDefault?: boolean; isActive?: boolean } },
      context: { req: Request },
    ) => {
      const user = authed(context);
      requirePermission(user, 'manage:payment-methods');
      if (user.role !== 'ADMIN') throw new Error('Only admins can manage payment methods.');

      const existing = await prisma.paymentMethod.findFirst({
        where: { id: input.paymentMethodId },
        include: { user: true },
      });
      if (!existing) throw new Error('Payment method was not found.');
      if (existing.user.country !== user.country)
        throw new Error('Cannot modify payment methods outside your country scope.');

      if (input.isDefault) {
        await prisma.paymentMethod.updateMany({
          where: { userId: existing.userId },
          data: { isDefault: false },
        });
      }

      const updated = await prisma.paymentMethod.update({
        where: { id: existing.id },
        data: {
          type: input.type,
          provider: input.provider,
          last4: input.last4,
          isDefault: input.isDefault,
          isActive: input.isActive,
        },
      });

      return toPaymentMethodModel(updated);
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Model mappers                                                      */
/* ------------------------------------------------------------------ */

interface OrderWithItems {
  id: string;
  userId: string;
  restaurantId: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  createdAt: Date;
  items: Array<{
    id: string;
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    menuItem: { name: string };
  }>;
}

function toOrderModel(order: OrderWithItems) {
  return {
    id: order.id,
    userId: order.userId,
    restaurantId: order.restaurantId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      menuItemId: item.menuItemId,
      menuItemName: item.menuItem.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.unitPrice * item.quantity,
    })),
  };
}

function toPaymentMethodModel(m: {
  id: string;
  userId: string;
  type: string;
  provider: string;
  last4: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: m.id,
    userId: m.userId,
    type: m.type,
    provider: m.provider,
    last4: m.last4,
    isDefault: m.isDefault,
    isActive: m.isActive,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

function createAuthPayload(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  country: string;
}) {
  const permissions = ROLE_PERMISSIONS[user.role] ?? [];
  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role as 'ADMIN' | 'MANAGER' | 'MEMBER',
    country: user.country as 'INDIA' | 'AMERICA',
    permissions,
  });

  return {
    accessToken: token,
    permissions,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      country: user.country,
    },
  };
}

async function resolveCountryScopedUser(
  actor: AuthUser,
  requestedUserId?: string,
): Promise<string> {
  const userId = requestedUserId ?? actor.sub;
  const user = await prisma.user.findFirst({
    where: { id: userId, country: actor.country },
  });
  if (!user) throw new Error('User is outside your country scope.');
  return user.id;
}
