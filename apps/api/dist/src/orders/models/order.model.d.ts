import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrderItemModel } from './order-item.model';
export declare class OrderModel {
    id: string;
    userId: string;
    restaurantId: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    subtotal: number;
    tax: number;
    total: number;
    notes?: string | null;
    createdAt: Date;
    items: OrderItemModel[];
}
