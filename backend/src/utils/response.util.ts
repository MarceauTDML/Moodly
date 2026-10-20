import type { Response } from 'express';
import type { ApiErrorBody, ApiSuccess } from '../types/api.types';

export const sendSuccess = <T>(res: Response, data: T, status = 200): Response<ApiSuccess<T>> =>
  res.status(status).json({ success: true, data });

export const sendNoContent = (res: Response): Response => res.status(204).send();

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = 'ERROR',
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toBody(): ApiErrorBody {
    return { success: false, error: { code: this.code, message: this.message, details: this.details } };
  }

  static badRequest(message: string, code = 'BAD_REQUEST', details?: unknown) {
    return new ApiError(400, message, code, details);
  }
  static unauthorized(message = 'Authentification requise', code = 'UNAUTHORIZED') {
    return new ApiError(401, message, code);
  }
  static forbidden(message = 'Accès refusé', code = 'FORBIDDEN') {
    return new ApiError(403, message, code);
  }
  static notFound(message = 'Ressource introuvable', code = 'NOT_FOUND') {
    return new ApiError(404, message, code);
  }
  static conflict(message: string, code = 'CONFLICT') {
    return new ApiError(409, message, code);
  }
}
