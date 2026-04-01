import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from '../common/auth-user.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { CreateOrderInput } from './dto/create-order.input';
import { OrderModel } from './models/order.model';
import { PaymentModel } from './models/payment.model';
import { OrdersService } from './orders.service';

@Resolver()
@UseGuards(GqlAuthGuard, PermissionsGuard)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => [OrderModel])
  @Permissions('view:orders')
  orders(@CurrentUser() user: AuthUser): Promise<OrderModel[]> {
    return this.ordersService.listForUser(user);
  }

  @Mutation(() => OrderModel)
  @Permissions('create:order')
  createOrder(
    @CurrentUser() user: AuthUser,
    @Args('input') input: CreateOrderInput,
  ): Promise<OrderModel> {
    return this.ordersService.create(user, input);
  }

  @Mutation(() => PaymentModel)
  @Permissions('checkout:order')
  checkoutOrder(
    @CurrentUser() user: AuthUser,
    @Args('orderId', { type: () => String }) orderId: string,
    @Args('paymentMethodId', { type: () => String, nullable: true })
    paymentMethodId?: string,
  ): Promise<PaymentModel> {
    return this.ordersService.checkout(user, orderId, paymentMethodId);
  }

  @Mutation(() => OrderModel)
  @Permissions('cancel:order')
  cancelOrder(
    @CurrentUser() user: AuthUser,
    @Args('orderId', { type: () => String }) orderId: string,
  ): Promise<OrderModel> {
    return this.ordersService.cancel(user, orderId);
  }
}
