import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  Payment,
  PaymentStatus,
  Prisma,
  Role,
} from '@prisma/client';
import { AuthUser } from '../common/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInput } from './dto/create-order.input';
import { OrderModel } from './models/order.model';
import { PaymentModel } from './models/payment.model';

type OrderWithItems = Order & {
  items: Array<OrderItem & { menuItem: MenuItem }>;
};

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(user: AuthUser): Promise<OrderModel[]> {
    const where: Prisma.OrderWhereInput = {
      restaurant: { country: user.country },
    };

    if (user.role === Role.MEMBER) {
      where.userId = user.sub;
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: {
          include: { menuItem: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => this.toOrderModel(order));
  }

  async create(user: AuthUser, input: CreateOrderInput): Promise<OrderModel> {
    if (!input.items.length) {
      throw new BadRequestException('At least one item is required.');
    }

    const restaurant = await this.prisma.restaurant.findFirst({
      where: {
        id: input.restaurantId,
        country: user.country,
      },
    });

    if (!restaurant) {
      throw new ForbiddenException('Restaurant is not available in your country.');
    }

    const uniqueMenuItemIds = [...new Set(input.items.map((item) => item.menuItemId))];
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: uniqueMenuItemIds },
        restaurantId: restaurant.id,
        isAvailable: true,
      },
    });

    if (menuItems.length !== uniqueMenuItemIds.length) {
      throw new BadRequestException('One or more menu items are invalid.');
    }

    const menuById = new Map(menuItems.map((item) => [item.id, item]));

    let subtotal = 0;
    const orderItems = input.items.map((item) => {
      const menuItem = menuById.get(item.menuItemId);
      if (!menuItem) {
        throw new BadRequestException('Invalid menu item in order.');
      }

      const unitPrice = Number(menuItem.price);
      subtotal += unitPrice * item.quantity;

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice,
      };
    });

    const tax = Number((subtotal * 0.05).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    const order = await this.prisma.order.create({
      data: {
        userId: user.sub,
        restaurantId: restaurant.id,
        subtotal,
        tax,
        total,
        notes: input.notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: { menuItem: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return this.toOrderModel(order);
  }

  async checkout(
    user: AuthUser,
    orderId: string,
    paymentMethodId?: string,
  ): Promise<PaymentModel> {
    if (user.role === Role.MEMBER) {
      throw new ForbiddenException('Members are not allowed to checkout.');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurant: { country: user.country },
      },
    });

    if (!order) {
      throw new NotFoundException('Order was not found in your country scope.');
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('This order cannot be checked out.');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('This order is already paid.');
    }

    if (paymentMethodId) {
      const paymentMethod = await this.prisma.paymentMethod.findFirst({
        where: {
          id: paymentMethodId,
          isActive: true,
          user: {
            country: user.country,
          },
        },
      });

      if (!paymentMethod) {
        throw new ForbiddenException('Payment method is outside your country scope.');
      }
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CONFIRMED,
          paymentStatus: PaymentStatus.PAID,
        },
      });

      return tx.payment.upsert({
        where: { orderId: order.id },
        update: {
          amount: order.total,
          status: PaymentStatus.PAID,
          paymentMethodId: paymentMethodId ?? null,
          processedAt: new Date(),
        },
        create: {
          orderId: order.id,
          amount: order.total,
          status: PaymentStatus.PAID,
          paymentMethodId: paymentMethodId ?? null,
          processedAt: new Date(),
        },
      });
    });

    return this.toPaymentModel(payment);
  }

  async cancel(user: AuthUser, orderId: string): Promise<OrderModel> {
    if (user.role === Role.MEMBER) {
      throw new ForbiddenException('Members are not allowed to cancel orders.');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurant: { country: user.country },
      },
      include: {
        items: {
          include: { menuItem: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order was not found in your country scope.');
    }

    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('This order cannot be cancelled.');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED },
      include: {
        items: {
          include: { menuItem: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return this.toOrderModel(updatedOrder);
  }

  private toOrderModel(order: OrderWithItems): OrderModel {
    return {
      id: order.id,
      userId: order.userId,
      restaurantId: order.restaurantId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      total: Number(order.total),
      notes: order.notes,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItem.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.unitPrice) * item.quantity,
      })),
    };
  }

  private toPaymentModel(payment: Payment): PaymentModel {
    return {
      id: payment.id,
      orderId: payment.orderId,
      paymentMethodId: payment.paymentMethodId,
      amount: Number(payment.amount),
      status: payment.status,
      processedAt: payment.processedAt,
    };
  }
}
