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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsResolver = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const permissions_decorator_1 = require("../common/decorators/permissions.decorator");
const gql_auth_guard_1 = require("../common/guards/gql-auth.guard");
const permissions_guard_1 = require("../common/guards/permissions.guard");
const add_payment_method_input_1 = require("./dto/add-payment-method.input");
const update_payment_method_input_1 = require("./dto/update-payment-method.input");
const payment_method_model_1 = require("./models/payment-method.model");
const payments_service_1 = require("./payments.service");
let PaymentsResolver = class PaymentsResolver {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    paymentMethods(user, userId) {
        return this.paymentsService.list(user, userId);
    }
    addPaymentMethod(user, input) {
        return this.paymentsService.add(user, input);
    }
    updatePaymentMethod(user, input) {
        return this.paymentsService.update(user, input);
    }
};
exports.PaymentsResolver = PaymentsResolver;
__decorate([
    (0, graphql_1.Query)(() => [payment_method_model_1.PaymentMethodModel]),
    (0, permissions_decorator_1.Permissions)('manage:payment-methods'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('userId', { type: () => String, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsResolver.prototype, "paymentMethods", null);
__decorate([
    (0, graphql_1.Mutation)(() => payment_method_model_1.PaymentMethodModel),
    (0, permissions_decorator_1.Permissions)('manage:payment-methods'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_payment_method_input_1.AddPaymentMethodInput]),
    __metadata("design:returntype", Promise)
], PaymentsResolver.prototype, "addPaymentMethod", null);
__decorate([
    (0, graphql_1.Mutation)(() => payment_method_model_1.PaymentMethodModel),
    (0, permissions_decorator_1.Permissions)('manage:payment-methods'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_payment_method_input_1.UpdatePaymentMethodInput]),
    __metadata("design:returntype", Promise)
], PaymentsResolver.prototype, "updatePaymentMethod", null);
exports.PaymentsResolver = PaymentsResolver = __decorate([
    (0, graphql_1.Resolver)(),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsResolver);
//# sourceMappingURL=payments.resolver.js.map