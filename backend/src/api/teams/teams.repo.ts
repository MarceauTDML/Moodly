import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.config';

const teamListSelect = {
  id: true,
  name: true,
  companyId: true,
  createdAt: true,
  _count: { select: { members: true } },
} satisfies Prisma.TeamSelect;

const memberSelect = {
  isLead: true,
  joinedAt: true,
  user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
} satisfies Prisma.TeamMemberSelect;

export const teamsRepo = {
  listForCompany: (companyId: string) =>
    prisma.team.findMany({ where: { companyId }, select: teamListSelect, orderBy: { name: 'asc' } }),

  listForUser: (userId: string, leadOnly: boolean) =>
    prisma.team.findMany({
      where: { members: { some: { userId, ...(leadOnly ? { isLead: true } : {}) } } },
      select: teamListSelect,
      orderBy: { name: 'asc' },
    }),

  findMembers: (teamId: string) =>
    prisma.teamMember.findMany({
      where: { teamId },
      select: memberSelect,
      orderBy: [{ isLead: 'desc' }, { user: { lastName: 'asc' } }],
    }),

  create: (companyId: string, name: string) => prisma.team.create({ data: { companyId, name }, select: teamListSelect }),

  update: (teamId: string, name: string) => prisma.team.update({ where: { id: teamId }, data: { name }, select: teamListSelect }),

  delete: (teamId: string) => prisma.team.delete({ where: { id: teamId } }),
};
