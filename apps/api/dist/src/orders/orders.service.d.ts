import { AuthUser } from '../common/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderInput } from './dto/create-order.input';
import { OrderModel } from './models/order.model';
import { PaymentModel } from './models/payment.model';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listForUser(user: AuthUser): Promise<OrderModel[]>;
    create(user: AuthUser, input: CreateOrderInput): Promise<OrderModel>;
    checkout(user: AuthUser, orderId: string, paymentMethodId?: string): Promise<PaymentModel>;
    cancel(user: AuthUser, orderId: string): Promise<OrderModel>;
    private toOrderModel;
    private toPaymentModel;
}
