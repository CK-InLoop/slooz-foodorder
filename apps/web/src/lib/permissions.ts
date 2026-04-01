import { SessionData } from './types';

export const APP_PERMISSIONS = {
  VIEW_RESTAURANTS: 'view:restaurants',
  VIEW_ORDERS: 'view:orders',
  CREATE_ORDER: 'create:order',
  CHECKOUT_ORDER: 'checkout:order',
  CANCEL_ORDER: 'cancel:order',
  MANAGE_PAYMENT_METHODS: 'manage:payment-methods',
} as const;

export function can(
  session: SessionData | null,
  permission: (typeof APP_PERMISSIONS)[keyof typeof APP_PERMISSIONS],
): boolean {
  return session?.permissions.includes(permission) ?? false;
}

export function isAdmin(session: SessionData | null): boolean {
  return session?.user.role === 'ADMIN';
}
