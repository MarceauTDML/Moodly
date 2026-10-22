import type { Role } from '../types/user.types';

export function accessSpace(role: Role | undefined): 'employee' | 'manager' | null {
  if (role === 'COLLABORATEUR') return 'employee';
  if (role === 'MANAGER' || role === 'ADMIN') return 'manager';
  return null;
}
