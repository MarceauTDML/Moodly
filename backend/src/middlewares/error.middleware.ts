import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { isProd } from '../config/env.config';
import { logger } from '../config/logger.config';
import { ApiError } from '../utils/response.util';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} introuvable`, 'ROUTE_NOT_FOUND'));
};

const fromPrisma = (err: Prisma.PrismaClientKnownRequestError): ApiError => {
  switch (err.code) {
    case 'P2002':
      return ApiError.conflict('Cette ressource existe déjà', 'ALREADY_EXISTS');
    case 'P2025':
      return ApiError.notFound();
    case 'P2003':
      return ApiError.badRequest('Référence invalide', 'INVALID_REFERENCE');
    default:
      return new ApiError(500, 'Erreur de base de données', 'DATABASE_ERROR');
  }
};

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    apiError = fromPrisma(err);
  } else if (err instanceof SyntaxError && 'body' in err) {
    apiError = ApiError.badRequest('JSON invalide', 'INVALID_JSON');
  } else if (typeof err === 'object' && err !== null && (err as { type?: string }).type === 'entity.too.large') {
    apiError = new ApiError(413, 'Requête trop volumineuse', 'PAYLOAD_TOO_LARGE');
  } else {
    apiError = new ApiError(500, 'Erreur interne du serveur', 'INTERNAL_ERROR');
  }

  if (apiError.statusCode >= 500) {
    logger.error({ err, method: req.method, url: req.originalUrl }, 'Erreur serveur');
  }

  const body = apiError.toBody();
  if (!isProd && apiError.statusCode >= 500 && err instanceof Error) {
    body.error.details = { message: err.message };
  }
  res.status(apiError.statusCode).json(body);
};
