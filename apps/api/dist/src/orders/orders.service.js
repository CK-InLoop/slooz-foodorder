"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listForUser(user) {
        const where = {
            restaurant: { country: user.country },
        };
        if (user.role === client_1.Role.MEMBER) {
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
    async create(user, input) {
        if (!input.items.length) {
            throw new common_1.BadRequestException('At least one item is required.');
        }
        const restaurant = await this.prisma.restaurant.findFirst({
            where: {
                id: input.restaurantId,
                country: user.country,
            },
        });
        if (!restaurant) {
            throw new common_1.ForbiddenException('Restaurant is not available in your country.');
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
            throw new common_1.BadRequestException('One or more menu items are invalid.');
        }
        const menuById = new Map(menuItems.map((item) => [item.id, item]));
        let subtotal = 0;
        const orderItems = input.items.map((item) => {
            const menuItem = menuById.get(item.menuItemId);
            if (!menuItem) {
                throw new common_1.BadRequestException('Invalid menu item in order.');
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
    async checkout(user, orderId, paymentMethodId) {
        if (user.role === client_1.Role.MEMBER) {
            throw new common_1.ForbiddenException('Members are not allowed to checkout.');
        }
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                restaurant: { country: user.country },
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order was not found in your country scope.');
        }
        if (order.status === client_1.OrderStatus.CANCELLED || order.status === client_1.OrderStatus.COMPLETED) {
            throw new common_1.BadRequestException('This order cannot be checked out.');
        }
        if (order.paymentStatus === client_1.PaymentStatus.PAID) {
            throw new common_1.BadRequestException('This order is already paid.');
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
                throw new common_1.ForbiddenException('Payment method is outside your country scope.');
            }
        }
        const payment = await this.prisma.$transaction(async (tx) => {
            await tx.order.update({
                where: { id: order.id },
                data: {
                    status: client_1.OrderStatus.CONFIRMED,
                    paymentStatus: client_1.PaymentStatus.PAID,
                },
            });
            return tx.payment.upsert({
                where: { orderId: order.id },
                update: {
                    amount: order.total,
                    status: client_1.PaymentStatus.PAID,
                    paymentMethodId: paymentMethodId ?? null,
                    processedAt: new Date(),
                },
                create: {
                    orderId: order.id,
                    amount: order.total,
                    status: client_1.PaymentStatus.PAID,
                    paymentMethodId: paymentMethodId ?? null,
                    processedAt: new Date(),
                },
            });
        });
        return this.toPaymentModel(payment);
    }
    async cancel(user, orderId) {
        if (user.role === client_1.Role.MEMBER) {
            throw new common_1.ForbiddenException('Members are not allowed to cancel orders.');
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
            throw new common_1.NotFoundException('Order was not found in your country scope.');
        }
        if (order.status === client_1.OrderStatus.CANCELLED || order.status === client_1.OrderStatus.COMPLETED) {
            throw new common_1.BadRequestException('This order cannot be cancelled.');
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id: order.id },
            data: { status: client_1.OrderStatus.CANCELLED },
            include: {
                items: {
                    include: { menuItem: true },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        return this.toOrderModel(updatedOrder);
    }
    toOrderModel(order) {
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
    toPaymentModel(payment) {
        return {
            id: payment.id,
            orderId: payment.orderId,
            paymentMethodId: payment.paymentMethodId,
            amount: Number(payment.amount),
            status: payment.status,
            processedAt: payment.processedAt,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map