import type { SessionUser } from './user.types';
export interface LoginInput {
  email: string;
  password: string;
  portal?: 'employee' | 'manager';
}
// /auth/login renvoie un objet direct, les autres routes utilisent { success, data }.
export interface LoginResponse {
  message: string;
  token: string;
  user: SessionUser;
}
export interface Session {
  token: string;
  user: SessionUser;
}
