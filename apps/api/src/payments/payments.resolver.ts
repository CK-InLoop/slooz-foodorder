import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { AuthUser } from '../common/auth-user.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { AddPaymentMethodInput } from './dto/add-payment-method.input';
import { UpdatePaymentMethodInput } from './dto/update-payment-method.input';
import { PaymentMethodModel } from './models/payment-method.model';
import { PaymentsService } from './payments.service';

@Resolver()
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Query(() => [PaymentMethodModel])
  @Permissions('manage:payment-methods')
  paymentMethods(
    @CurrentUser() user: AuthUser,
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
  ): Promise<PaymentMethodModel[]> {
    return this.paymentsService.list(user, userId);
  }

  @Mutation(() => PaymentMethodModel)
  @Permissions('manage:payment-methods')
  addPaymentMethod(
    @CurrentUser() user: AuthUser,
    @Args('input') input: AddPaymentMethodInput,
  ): Promise<PaymentMethodModel> {
    return this.paymentsService.add(user, input);
  }

  @Mutation(() => PaymentMethodModel)
  @Permissions('manage:payment-methods')
  updatePaymentMethod(
    @CurrentUser() user: AuthUser,
    @Args('input') input: UpdatePaymentMethodInput,
  ): Promise<PaymentMethodModel> {
    return this.paymentsService.update(user, input);
  }
}
