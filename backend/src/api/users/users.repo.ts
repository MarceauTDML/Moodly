import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.config';
import type { AuthUser } from '../../types/auth.types';

export const userListSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  companyId: true,
  createdAt: true,
  memberships: {
    select: { isLead: true, team: { select: { id: true, name: true } } },
  },
} satisfies Prisma.UserSelect;

const collaboratorScope = (actor: AuthUser): Prisma.UserWhereInput => ({
  companyId: actor.companyId,
  role: 'COLLABORATEUR',
  ...(actor.role === 'ADMIN'
    ? {}
    : {
        memberships: {
          some: {
            team: { members: { some: { userId: actor.id, isLead: true } } },
          },
        },
      }),
});
const collaboratorSelect = {
  ...userListSelect,
  passwordHash: true,
  invitationSentAt: true,
} satisfies Prisma.UserSelect;
export const usersRepo = {
  listCollaborators: (actor: AuthUser) =>
    prisma.user.findMany({
      where: collaboratorScope(actor),
      select: collaboratorSelect,
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    }),
  findCollaborator: (actor: AuthUser, id: string) =>
    prisma.user.findFirst({
      where: { ...collaboratorScope(actor), id },
      select: collaboratorSelect,
    }),
  findManagedTeam: (actor: AuthUser, id: string) =>
    prisma.team.findFirst({
      where: {
        id,
        companyId: actor.companyId,
        ...(actor.role === 'ADMIN'
          ? {}
          : { members: { some: { userId: actor.id, isLead: true } } }),
      },
    }),
  updateCollaborator: (id: string, data: Prisma.UserUpdateInput) =>
    prisma.user.update({ where: { id }, data, select: collaboratorSelect }),

  findById: (id: string) => prisma.user.findUnique({ where: { id } }),

  findInCompany: (id: string, companyId: string) =>
    prisma.user.findFirst({ where: { id, companyId } }),

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
                {
                  firstName: { contains: filters.search, mode: 'insensitive' },
                },
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

  clearPushToken: (id: string, pushToken: string) =>
    prisma.user.updateMany({ where: { id, pushToken }, data: { pushToken: null } }),

  countAdmins: (companyId: string) => prisma.user.count({ where: { companyId, role: 'ADMIN' } }),

  findForExport: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        dailyReminderEnabled: true,
        emailNotificationsEnabled: true,
        pushToken: true,
        company: { select: { name: true } },
        memberships: { select: { isLead: true, joinedAt: true, team: { select: { name: true } } } },
        checkins: { select: { date: true }, orderBy: { date: 'asc' } },
      },
    }),

  createWithMembership: (
    data: Prisma.UserUncheckedCreateInput,
    membership?: { teamId: string; isLead: boolean },
  ) =>
    prisma.user.create({
      data: {
        ...data,
        memberships: membership
          ? { create: { teamId: membership.teamId, isLead: membership.isLead } }
          : undefined,
      },
    }),

  findTeamInCompany: (teamId: string, companyId: string) =>
    prisma.team.findFirst({ where: { id: teamId, companyId } }),
};
