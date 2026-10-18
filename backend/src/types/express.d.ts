import type { Team } from '@prisma/client';
import type { AuthUser } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      team?: Team;
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
