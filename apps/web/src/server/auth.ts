import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import type { Country, Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET ?? 'super-secret-dev-key';

export interface AuthUser {
  sub: string;
  email: string;
  role: Role;
  country: Country;
  permissions: string[];
}

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function extractUser(req: Request): AuthUser | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyToken(authHeader.slice(7));
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export type Permission =
  | 'view:restaurants'
  | 'view:orders'
  | 'create:order'
  | 'checkout:order'
  | 'cancel:order'
  | 'manage:payment-methods';

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
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

export function hasPermission(role: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

function requireAuth(user: AuthUser | null): AuthUser {
  if (!user) throw new Error('Not authenticated');
  return user;
}

function requirePermission(user: AuthUser, permission: Permission): void {
  if (!hasPermission(user.role, permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}

export { requireAuth, requirePermission };
