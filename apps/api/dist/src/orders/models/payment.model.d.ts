import { PaymentStatus } from '@prisma/client';
export declare class PaymentModel {
    id: string;
    orderId: string;
    paymentMethodId?: string | null;
    amount: number;
    status: PaymentStatus;
    processedAt?: Date | null;
}
