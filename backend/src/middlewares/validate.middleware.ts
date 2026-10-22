import type { NextFunction, Request, Response } from 'express';
import { z, type ZodType } from 'zod';
import { ApiError } from '../utils/response.util';

z.config(z.locales.fr());

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export const validate =
  (schemas: Schemas) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const validated: NonNullable<Request['validated']> = {};
    const errors: { location: string; path: string; message: string }[] = [];

    for (const location of ['params', 'query', 'body'] as const) {
      const schema = schemas[location];
      if (!schema) continue;
      const result = schema.safeParse(req[location] ?? {});
      if (result.success) {
        validated[location] = result.data;
      } else {
        for (const issue of result.error.issues) {
          errors.push({ location, path: issue.path.join('.'), message: issue.message });
        }
      }
    }

    if (errors.length) throw ApiError.badRequest('Données invalides', 'VALIDATION_ERROR', errors);

    req.validated = validated;
    if (validated.body !== undefined) req.body = validated.body;
    next();
  };

export const getBody = <T>(req: Request): T => req.validated?.body as T;
export const getQuery = <T>(req: Request): T => req.validated?.query as T;
export const getParams = <T>(req: Request): T => req.validated?.params as T;
