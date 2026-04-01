import type { AuthUser } from '../common/auth-user.interface';
import { CreateOrderInput } from './dto/create-order.input';
import { OrderModel } from './models/order.model';
import { PaymentModel } from './models/payment.model';
import { OrdersService } from './orders.service';
export declare class OrdersResolver {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    orders(user: AuthUser): Promise<OrderModel[]>;
    createOrder(user: AuthUser, input: CreateOrderInput): Promise<OrderModel>;
    checkoutOrder(user: AuthUser, orderId: string, paymentMethodId?: string): Promise<PaymentModel>;
    cancelOrder(user: AuthUser, orderId: string): Promise<OrderModel>;
}
