import { Role } from '@prisma/client';

export type Permission =
  | 'view:restaurants'
  | 'view:orders'
  | 'create:order'
  | 'checkout:order'
  | 'cancel:order'
  | 'manage:payment-methods';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
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

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
