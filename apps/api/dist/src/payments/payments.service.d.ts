import { AuthUser } from '../common/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { AddPaymentMethodInput } from './dto/add-payment-method.input';
import { UpdatePaymentMethodInput } from './dto/update-payment-method.input';
import { PaymentMethodModel } from './models/payment-method.model';
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(actor: AuthUser, targetUserId?: string): Promise<PaymentMethodModel[]>;
    add(actor: AuthUser, input: AddPaymentMethodInput): Promise<PaymentMethodModel>;
    update(actor: AuthUser, input: UpdatePaymentMethodInput): Promise<PaymentMethodModel>;
    private assertAdmin;
    private resolveCountryScopedUser;
    private toModel;
}
