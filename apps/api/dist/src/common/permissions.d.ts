import { Role } from '@prisma/client';
export type Permission = 'view:restaurants' | 'view:orders' | 'create:order' | 'checkout:order' | 'cancel:order' | 'manage:payment-methods';
export declare const ROLE_PERMISSIONS: Record<Role, Permission[]>;
export declare function hasPermission(role: Role, permission: Permission): boolean;
