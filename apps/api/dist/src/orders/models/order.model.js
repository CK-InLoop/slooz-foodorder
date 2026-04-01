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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const order_item_model_1 = require("./order-item.model");
let OrderModel = class OrderModel {
    id;
    userId;
    restaurantId;
    status;
    paymentStatus;
    subtotal;
    tax;
    total;
    notes;
    createdAt;
    items;
};
exports.OrderModel = OrderModel;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], OrderModel.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OrderModel.prototype, "userId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], OrderModel.prototype, "restaurantId", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.OrderStatus),
    __metadata("design:type", String)
], OrderModel.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.PaymentStatus),
    __metadata("design:type", String)
], OrderModel.prototype, "paymentStatus", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], OrderModel.prototype, "subtotal", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], OrderModel.prototype, "tax", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Number)
], OrderModel.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Object)
], OrderModel.prototype, "notes", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], OrderModel.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [order_item_model_1.OrderItemModel]),
    __metadata("design:type", Array)
], OrderModel.prototype, "items", void 0);
exports.OrderModel = OrderModel = __decorate([
    (0, graphql_1.ObjectType)()
], OrderModel);
//# sourceMappingURL=order.model.js.map