import type { SessionUser } from './user.types';
export interface LoginInput {
  email: string;
  password: string;
  portal?: 'employee' | 'manager';
}
// /auth/login renvoie un objet direct, les autres routes utilisent { success, data }.
export interface SessionTokens {
  token: string;
  refreshToken: string;
}
export interface LoginResponse extends SessionTokens {
  message: string;
  user: SessionUser;
}
export interface Session extends SessionTokens {
  user: SessionUser;
}
