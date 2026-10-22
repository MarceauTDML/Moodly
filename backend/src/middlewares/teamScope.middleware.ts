import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma.config';
import { ApiError } from '../utils/response.util';

interface TeamScopeOptions {
  allowMembers?: boolean;
}

export const teamScope =
  (options: TeamScopeOptions = {}) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) throw ApiError.unauthorized();

    const fromParams = typeof req.params.teamId === 'string' ? req.params.teamId : undefined;
    const fromQuery = typeof req.query.teamId === 'string' ? req.query.teamId : undefined;
    let teamId: string | undefined = fromParams ?? fromQuery;

    if (!teamId) {
      const membership = await prisma.teamMember.findFirst({
        where: { userId: user.id, ...(options.allowMembers ? {} : { isLead: true }) },
        orderBy: { joinedAt: 'asc' },
        select: { teamId: true },
      });
      teamId = membership?.teamId;

      if (!teamId && user.role === 'ADMIN') {
        const first = await prisma.team.findFirst({
          where: { companyId: user.companyId },
          orderBy: { createdAt: 'asc' },
          select: { id: true },
        });
        teamId = first?.id;
      }
      if (!teamId) throw ApiError.notFound('Aucune équipe associée à votre compte', 'NO_TEAM');
    }

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.companyId !== user.companyId) throw ApiError.notFound('Équipe introuvable', 'TEAM_NOT_FOUND');

    if (user.role !== 'ADMIN') {
      const membership = await prisma.teamMember.findUnique({
        where: { userId_teamId: { userId: user.id, teamId } },
        select: { isLead: true },
      });
      if (!membership || (!options.allowMembers && !membership.isLead)) {
        throw ApiError.forbidden("Vous n'avez pas accès à cette équipe");
      }
    }

    req.team = team;
    next();
  };
