import type { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  companyId: string;
}

export interface AccessTokenPayload {
  sub: string;
  role: Role;
  companyId: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  ver: string;
  type: 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  companyId: string;
  createdAt: Date;
}
