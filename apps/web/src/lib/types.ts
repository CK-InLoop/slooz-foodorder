export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER';
export type Country = 'INDIA' | 'AMERICA';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  country: Country;
}

export interface SessionData {
  accessToken: string;
  permissions: string[];
  user: SessionUser;
}
