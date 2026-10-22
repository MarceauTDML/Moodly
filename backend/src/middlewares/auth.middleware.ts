import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.config';
import { verifyAccessToken } from '../services/token.service';
import { ApiError } from '../utils/response.util';

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw ApiError.unauthorized();

  const payload = verifyAccessToken(header.slice(7).trim());
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, companyId: true },
  });
  if (!user) throw ApiError.unauthorized('Utilisateur introuvable', 'INVALID_TOKEN');

  req.user = user;
  next();
};
