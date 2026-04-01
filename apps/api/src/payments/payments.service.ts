import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, Role } from '@prisma/client';
import { AuthUser } from '../common/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { AddPaymentMethodInput } from './dto/add-payment-method.input';
import { UpdatePaymentMethodInput } from './dto/update-payment-method.input';
import { PaymentMethodModel } from './models/payment-method.model';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    actor: AuthUser,
    targetUserId?: string,
  ): Promise<PaymentMethodModel[]> {
    this.assertAdmin(actor);

    const scopedUserId = await this.resolveCountryScopedUser(actor, targetUserId);

    const paymentMethods = await this.prisma.paymentMethod.findMany({
      where: { userId: scopedUserId },
      orderBy: { createdAt: 'desc' },
    });

    return paymentMethods.map((method) => this.toModel(method));
  }

  async add(
    actor: AuthUser,
    input: AddPaymentMethodInput,
  ): Promise<PaymentMethodModel> {
    this.assertAdmin(actor);
    const scopedUserId = await this.resolveCountryScopedUser(actor, input.userId);

    if (input.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: scopedUserId },
        data: { isDefault: false },
      });
    }

    const paymentMethod = await this.prisma.paymentMethod.create({
      data: {
        userId: scopedUserId,
        type: input.type,
        provider: input.provider,
        last4: input.last4,
        isDefault: input.isDefault ?? false,
      },
    });

    return this.toModel(paymentMethod);
  }

  async update(
    actor: AuthUser,
    input: UpdatePaymentMethodInput,
  ): Promise<PaymentMethodModel> {
    this.assertAdmin(actor);

    const existing = await this.prisma.paymentMethod.findFirst({
      where: { id: input.paymentMethodId },
      include: { user: true },
    });

    if (!existing) {
      throw new NotFoundException('Payment method was not found.');
    }

    if (existing.user.country !== actor.country) {
      throw new ForbiddenException('Cannot modify payment methods outside your country scope.');
    }

    if (input.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId: existing.userId },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.paymentMethod.update({
      where: { id: existing.id },
      data: {
        type: input.type,
        provider: input.provider,
        last4: input.last4,
        isDefault: input.isDefault,
        isActive: input.isActive,
      },
    });

    return this.toModel(updated);
  }

  private assertAdmin(actor: AuthUser) {
    if (actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can manage payment methods.');
    }
  }

  private async resolveCountryScopedUser(
    actor: AuthUser,
    requestedUserId?: string,
  ): Promise<string> {
    const userId = requestedUserId ?? actor.sub;

    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        country: actor.country,
      },
    });

    if (!user) {
      throw new ForbiddenException('User is outside your country scope.');
    }

    return user.id;
  }

  private toModel(method: PaymentMethod): PaymentMethodModel {
    return {
      id: method.id,
      userId: method.userId,
      type: method.type,
      provider: method.provider,
      last4: method.last4,
      isDefault: method.isDefault,
      isActive: method.isActive,
      createdAt: method.createdAt,
      updatedAt: method.updatedAt,
    };
  }
}
