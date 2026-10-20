import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.config';

export const userListSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  companyId: true,
  createdAt: true,
  memberships: { select: { isLead: true, team: { select: { id: true, name: true } } } },
} satisfies Prisma.UserSelect;

export const usersRepo = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),

  findInCompany: (id: string, companyId: string) => prisma.user.findFirst({ where: { id, companyId } }),

  findDetailed: (id: string) => prisma.user.findUnique({ where: { id }, select: userListSelect }),

  findCompany: (companyId: string) => prisma.company.findUnique({ where: { id: companyId } }),

  list: (companyId: string, filters: { role?: Prisma.UserWhereInput['role']; search?: string }) =>
    prisma.user.findMany({
      where: {
        companyId,
        role: filters.role,
        ...(filters.search
          ? {
              OR: [
                { email: { contains: filters.search, mode: 'insensitive' } },
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: userListSelect,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),

  update: (id: string, data: Prisma.UserUpdateInput) => prisma.user.update({ where: { id }, data }),

  delete: (id: string) => prisma.user.delete({ where: { id } }),

  createWithMembership: (data: Prisma.UserUncheckedCreateInput, membership?: { teamId: string; isLead: boolean }) =>
    prisma.user.create({
      data: {
        ...data,
        memberships: membership ? { create: { teamId: membership.teamId, isLead: membership.isLead } } : undefined,
      },
    }),

  findTeamInCompany: (teamId: string, companyId: string) => prisma.team.findFirst({ where: { id: teamId, companyId } }),
};
