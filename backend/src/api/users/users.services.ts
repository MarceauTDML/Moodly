import type { User } from '@prisma/client';
import { PENDING_ACTIVATION_HASH } from '../../config/auth.config';
import { emailService } from '../../services/email.service';
import type { AuthUser, PublicUser } from '../../types/auth.types';
import { hashPassword, verifyPassword } from '../../utils/hash.util';
import { ApiError } from '../../utils/response.util';
import { usersRepo } from './users.repo';
import type {
  ChangePasswordInput,
  CreateUserInput,
  ListUsersQuery,
  NotificationSettingsInput,
  PushTokenInput,
  UpdateMeInput,
  UpdateUserInput,
} from './users.validators';

const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  companyId: user.companyId,
  createdAt: user.createdAt,
});

const getUserOrThrow = async (id: string) => {
  const user = await usersRepo.findById(id);
  if (!user) throw ApiError.notFound('Utilisateur introuvable');
  return user;
};

const toNotificationSettings = (user: {
  dailyReminderEnabled: boolean;
  emailNotificationsEnabled: boolean;
  pushToken: string | null;
}) => ({
  dailyReminderEnabled: user.dailyReminderEnabled,
  emailNotificationsEnabled: user.emailNotificationsEnabled,
  pushEnabled: Boolean(user.pushToken),
});

export const usersService = {
  async getProfile(userId: string) {
    const user = await usersRepo.findDetailed(userId);
    if (!user) throw ApiError.notFound('Utilisateur introuvable');
    const company = await usersRepo.findCompany(user.companyId);
    return {
      ...user,
      company: company ? { id: company.id, name: company.name } : null,
      teams: user.memberships.map((m) => ({ ...m.team, isLead: m.isLead })),
      memberships: undefined,
    };
  },

  async updateProfile(userId: string, input: UpdateMeInput) {
    return toPublicUser(await usersRepo.update(userId, input));
  },

  async changePassword(userId: string, { currentPassword, newPassword }: ChangePasswordInput) {
    const user = await getUserOrThrow(userId);
    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      throw ApiError.badRequest('Mot de passe actuel incorrect', 'INVALID_PASSWORD');
    }
    await usersRepo.update(userId, { passwordHash: await hashPassword(newPassword) });
  },

  async getNotificationSettings(userId: string) {
    return toNotificationSettings(await getUserOrThrow(userId));
  },

  async updateNotificationSettings(userId: string, input: NotificationSettingsInput) {
    return toNotificationSettings(await usersRepo.update(userId, input));
  },

  async setPushToken(userId: string, { pushToken }: PushTokenInput) {
    return toNotificationSettings(await usersRepo.update(userId, { pushToken }));
  },

  list(companyId: string, query: ListUsersQuery) {
    return usersRepo.list(companyId, query);
  },

  async getById(actor: AuthUser, userId: string) {
    const user = await usersRepo.findInCompany(userId, actor.companyId);
    if (!user) throw ApiError.notFound('Utilisateur introuvable');
    return usersRepo.findDetailed(userId);
  },

  async create(actor: AuthUser, input: CreateUserInput) {
    const company = await usersRepo.findCompany(actor.companyId);
    if (!company) throw ApiError.notFound('Entreprise introuvable');

    const domain = input.email.split('@')[1];
    if (domain !== company.domain.toLowerCase()) {
      throw ApiError.badRequest(`L'e-mail doit appartenir au domaine @${company.domain}`, 'INVALID_EMAIL_DOMAIN');
    }
    if (input.teamId && !(await usersRepo.findTeamInCompany(input.teamId, actor.companyId))) {
      throw ApiError.notFound('Équipe introuvable', 'TEAM_NOT_FOUND');
    }

    // Même principe que POST /auth/collaborators : le compte est activé via POST /auth/register
    const user = await usersRepo.createWithMembership(
      {
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        companyId: actor.companyId,
        passwordHash: PENDING_ACTIVATION_HASH,
      },
      input.teamId ? { teamId: input.teamId, isLead: input.isLead } : undefined,
    );

    await emailService.sendWelcome(user.email, user.firstName);
    return usersRepo.findDetailed(user.id);
  },

  async update(actor: AuthUser, userId: string, input: UpdateUserInput) {
    const target = await usersRepo.findInCompany(userId, actor.companyId);
    if (!target) throw ApiError.notFound('Utilisateur introuvable');
    if (target.id === actor.id && input.role && input.role !== actor.role) {
      throw ApiError.badRequest('Vous ne pouvez pas modifier votre propre rôle', 'SELF_ROLE_CHANGE');
    }
    await usersRepo.update(userId, input);
    return usersRepo.findDetailed(userId);
  },

  async remove(actor: AuthUser, userId: string) {
    if (userId === actor.id) throw ApiError.badRequest('Vous ne pouvez pas supprimer votre propre compte', 'SELF_DELETE');
    const target = await usersRepo.findInCompany(userId, actor.companyId);
    if (!target) throw ApiError.notFound('Utilisateur introuvable');
    await usersRepo.delete(userId);
  },
};
