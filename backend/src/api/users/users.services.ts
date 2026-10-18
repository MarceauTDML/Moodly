import type { User } from '@prisma/client';
import type { PublicUser } from '../../types/auth.types';
import { hashPassword, verifyPassword } from '../../utils/hash.util';
import { ApiError } from '../../utils/response.util';
import { usersRepo } from './users.repo';
import type { ChangePasswordInput, NotificationSettingsInput, PushTokenInput, UpdateMeInput } from './users.validators';

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
};
