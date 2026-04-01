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
exports.RestaurantModel = void 0;
const graphql_1 = require("@nestjs/graphql");
const client_1 = require("@prisma/client");
const menu_item_model_1 = require("./menu-item.model");
let RestaurantModel = class RestaurantModel {
    id;
    name;
    description;
    city;
    country;
    menuItems;
};
exports.RestaurantModel = RestaurantModel;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], RestaurantModel.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RestaurantModel.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Object)
], RestaurantModel.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], RestaurantModel.prototype, "city", void 0);
__decorate([
    (0, graphql_1.Field)(() => client_1.Country),
    __metadata("design:type", String)
], RestaurantModel.prototype, "country", void 0);
__decorate([
    (0, graphql_1.Field)(() => [menu_item_model_1.MenuItemModel]),
    __metadata("design:type", Array)
], RestaurantModel.prototype, "menuItems", void 0);
exports.RestaurantModel = RestaurantModel = __decorate([
    (0, graphql_1.ObjectType)()
], RestaurantModel);
//# sourceMappingURL=restaurant.model.js.map