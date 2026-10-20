import type { SignOptions } from 'jsonwebtoken';
import { env } from './env.config';

export const jwtConfig = {
  issuer: 'moodmap-api',
  access: {
    secret: env.JWT_ACCESS_SECRET,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  },
  refresh: {
    secret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  },
} as const;
