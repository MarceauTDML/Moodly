import rateLimit from 'express-rate-limit';
import { isTest } from '../config/env.config';

const message = (msg: string) => ({ success: false, error: { code: 'TOO_MANY_REQUESTS', message: msg } });

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => isTest,
  message: message('Trop de requêtes, réessayez plus tard.'),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => isTest,
  message: message('Trop de tentatives, réessayez dans quelques minutes.'),
});

// /password/forgot répond toujours 200 (pas d'énumération de comptes) : chaque appel compte,
// sinon authLimiter, qui ignore les succès, ne limiterait jamais l'envoi d'e-mails.
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => isTest,
  message: message('Trop de demandes, réessayez dans quelques minutes.'),
});

// À placer après validate() : la clé est l'adresse normalisée, quelle que soit l'IP d'origine.
export const forgotPasswordEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => isTest,
  keyGenerator: (req) => `forgot:${String(req.body?.email ?? '')}`,
  message: message('Trop de demandes pour cette adresse, réessayez plus tard.'),
});
