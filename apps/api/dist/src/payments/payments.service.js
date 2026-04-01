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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(actor, targetUserId) {
        this.assertAdmin(actor);
        const scopedUserId = await this.resolveCountryScopedUser(actor, targetUserId);
        const paymentMethods = await this.prisma.paymentMethod.findMany({
            where: { userId: scopedUserId },
            orderBy: { createdAt: 'desc' },
        });
        return paymentMethods.map((method) => this.toModel(method));
    }
    async add(actor, input) {
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
    async update(actor, input) {
        this.assertAdmin(actor);
        const existing = await this.prisma.paymentMethod.findFirst({
            where: { id: input.paymentMethodId },
            include: { user: true },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Payment method was not found.');
        }
        if (existing.user.country !== actor.country) {
            throw new common_1.ForbiddenException('Cannot modify payment methods outside your country scope.');
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
    assertAdmin(actor) {
        if (actor.role !== client_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only admins can manage payment methods.');
        }
    }
    async resolveCountryScopedUser(actor, requestedUserId) {
        const userId = requestedUserId ?? actor.sub;
        const user = await this.prisma.user.findFirst({
            where: {
                id: userId,
                country: actor.country,
            },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User is outside your country scope.');
        }
        return user.id;
    }
    toModel(method) {
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map