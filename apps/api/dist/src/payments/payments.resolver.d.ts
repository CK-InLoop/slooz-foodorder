import type { AuthUser } from '../common/auth-user.interface';
import { AddPaymentMethodInput } from './dto/add-payment-method.input';
import { UpdatePaymentMethodInput } from './dto/update-payment-method.input';
import { PaymentMethodModel } from './models/payment-method.model';
import { PaymentsService } from './payments.service';
export declare class PaymentsResolver {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    paymentMethods(user: AuthUser, userId?: string): Promise<PaymentMethodModel[]>;
    addPaymentMethod(user: AuthUser, input: AddPaymentMethodInput): Promise<PaymentMethodModel>;
    updatePaymentMethod(user: AuthUser, input: UpdatePaymentMethodInput): Promise<PaymentMethodModel>;
}
