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

  findDetailed: (id: string) => prisma.user.findUnique({ where: { id }, select: userListSelect }),

  findCompany: (companyId: string) => prisma.company.findUnique({ where: { id: companyId } }),

  update: (id: string, data: Prisma.UserUpdateInput) => prisma.user.update({ where: { id }, data }),
};
