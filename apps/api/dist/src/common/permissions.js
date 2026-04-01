"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = void 0;
exports.hasPermission = hasPermission;
exports.ROLE_PERMISSIONS = {
    ADMIN: [
        'view:restaurants',
        'view:orders',
        'create:order',
        'checkout:order',
        'cancel:order',
        'manage:payment-methods',
    ],
    MANAGER: [
        'view:restaurants',
        'view:orders',
        'create:order',
        'checkout:order',
        'cancel:order',
    ],
    MEMBER: ['view:restaurants', 'view:orders', 'create:order'],
};
function hasPermission(role, permission) {
    return exports.ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
//# sourceMappingURL=permissions.js.map