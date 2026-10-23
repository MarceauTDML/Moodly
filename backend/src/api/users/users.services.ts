import type { User } from '@prisma/client';
import { PENDING_ACTIVATION_HASH } from '../../config/auth.config';
import { emailService, appLink } from '../../services/email.service';
import { isMailerConfigured } from '../../config/mailer.config';
import { isProd } from '../../config/env.config';
import { generateResetToken } from '../../services/token.service';
import type { CollaboratorInput, UpdateCollaboratorInput } from './users.validators';
import type { AuthUser, PublicUser } from '../../types/auth.types';
import { formatDay } from '../../utils/date.util';
import { hashPassword, verifyPassword } from '../../utils/hash.util';
import { ApiError } from '../../utils/response.util';
import { usersRepo } from './users.repo';
import type {
  ChangePasswordInput,
  CreateUserInput,
  DeleteMeInput,
  ListUsersQuery,
  NotificationSettingsInput,
  PushTokenInput,
  RemovePushTokenInput,
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

const collaboratorDto = ({
  passwordHash,
  ...user
}: Awaited<ReturnType<typeof usersRepo.listCollaborators>>[number]) => ({
  ...user,
  status: passwordHash === PENDING_ACTIVATION_HASH ? ('PENDING' as const) : ('ACTIVE' as const),
});
const assertDomain = async (companyId: string, email: string) => {
  const company = await usersRepo.findCompany(companyId);
  if (!company) throw ApiError.notFound('Entreprise introuvable');
  if (email.split('@')[1] !== company.domain.toLowerCase())
    throw ApiError.badRequest(`Utilisez une adresse @${company.domain}.`, 'INVALID_EMAIL_DOMAIN');
};
const managedCollaborator = async (actor: AuthUser, id: string) => {
  const user = await usersRepo.findCollaborator(actor, id);
  if (!user) throw ApiError.notFound('Collaborateur introuvable');
  return user;
};
export const usersService = {
  async listCollaborators(actor: AuthUser) {
    return (await usersRepo.listCollaborators(actor)).map(collaboratorDto);
  },
  async getCollaborator(actor: AuthUser, id: string) {
    return collaboratorDto(await managedCollaborator(actor, id));
  },
  async createCollaborator(actor: AuthUser, input: CollaboratorInput) {
    await assertDomain(actor.companyId, input.email);
    if (!(await usersRepo.findManagedTeam(actor, input.teamId)))
      throw ApiError.notFound('Équipe introuvable', 'TEAM_NOT_FOUND');
    const user = await usersRepo.createWithMembership(
      {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        passwordHash: PENDING_ACTIVATION_HASH,
        companyId: actor.companyId,
        role: 'COLLABORATEUR',
      },
      { teamId: input.teamId, isLead: false },
    );
    return usersService.getCollaborator(actor, user.id);
  },
  async updateCollaborator(actor: AuthUser, id: string, input: UpdateCollaboratorInput) {
    const target = await managedCollaborator(actor, id);
    if (target.memberships.length > 1)
      throw ApiError.conflict(
        'Ce compte appartient à plusieurs équipes. Contactez un administrateur.',
        'MULTIPLE_TEAMS',
      );
    await assertDomain(actor.companyId, input.email);
    if (!(await usersRepo.findManagedTeam(actor, input.teamId)))
      throw ApiError.notFound('Équipe introuvable', 'TEAM_NOT_FOUND');
    const { teamId, ...fields } = input;
    if (target.email !== input.email && target.passwordHash !== PENDING_ACTIVATION_HASH) {
      throw ApiError.badRequest(
        'L’adresse d’un compte actif ne peut pas être modifiée ici.',
        'ACTIVE_EMAIL_CHANGE',
      );
    }
    return collaboratorDto(
      await usersRepo.updateCollaborator(id, {
        ...fields,
        ...(target.email === input.email
          ? {}
          : {
              invitationToken: null,
              invitationTokenExpiry: null,
              invitationSentAt: null,
            }),
        memberships: { deleteMany: {}, create: { teamId, isLead: false } },
      }),
    );
  },
  async inviteCollaborator(actor: AuthUser, id: string) {
    const user = await managedCollaborator(actor, id);
    if (user.passwordHash !== PENDING_ACTIVATION_HASH)
      throw ApiError.conflict('Ce compte est déjà actif.', 'ALREADY_ACTIVE');
    if (isProd && !isMailerConfigured)
      throw new ApiError(503, 'L’envoi des invitations n’est pas configuré.', 'MAIL_UNAVAILABLE');
    const { token, hash } = generateResetToken();
    const invitationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await usersRepo.update(id, {
      invitationToken: hash,
      invitationTokenExpiry,
    });
    await emailService.sendInvitation(user.email, user.firstName, token);
    const invitationSentAt = isMailerConfigured ? new Date() : null;
    await usersRepo.update(id, { invitationSentAt });
    return {
      message: isMailerConfigured
        ? 'Invitation envoyée. Le compte sera actif après la création du mot de passe.'
        : 'Invitation préparée. Partagez le lien avec le collaborateur pour lui permettre de créer son mot de passe.',
      delivery: isMailerConfigured ? 'EMAIL' : 'MANUAL',
      expiresAt: invitationTokenExpiry,
      ...(!isProd && !isMailerConfigured
        ? { activationUrl: appLink('activate-account', { token }) }
        : {}),
    };
  },
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
    await usersRepo.update(userId, {
      passwordHash: await hashPassword(newPassword),
    });
  },

  // RGPD, droit à l'effacement. Les réponses de mood ne sont liées à aucun compte :
  // elles restent dans les statistiques d'équipe, sans pouvoir être rattachées à personne.
  async deleteMe(userId: string, { password }: DeleteMeInput) {
    const user = await getUserOrThrow(userId);
    if (!(await verifyPassword(password, user.passwordHash))) {
      throw ApiError.badRequest('Mot de passe incorrect', 'INVALID_PASSWORD');
    }
    if (user.role === 'ADMIN' && (await usersRepo.countAdmins(user.companyId)) <= 1) {
      throw ApiError.conflict(
        'Vous êtes le dernier administrateur de l’entreprise. Nommez un autre administrateur avant de supprimer votre compte.',
        'LAST_ADMIN',
      );
    }
    await usersRepo.delete(userId);
  },

  // RGPD, droit à la portabilité : tout ce que le serveur sait du compte, sans secret technique.
  async exportMe(userId: string) {
    const user = await usersRepo.findForExport(userId);
    if (!user) throw ApiError.notFound('Utilisateur introuvable');
    return {
      exportedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      company: user.company.name,
      teams: user.memberships.map((m) => ({ name: m.team.name, isLead: m.isLead, joinedAt: m.joinedAt })),
      preferences: {
        dailyReminderEnabled: user.dailyReminderEnabled,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
        pushEnabled: Boolean(user.pushToken),
      },
      participationDays: user.checkins.map((c) => formatDay(c.date)),
      moods: {
        included: false,
        reason:
          'Tes réponses sont enregistrées sans aucun lien avec ton compte : personne ne peut les retrouver pour te les rendre, pas même Mood Map. Ton historique personnel existe uniquement sur ton téléphone.',
      },
    };
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

  // À la déconnexion : un autre téléphone enregistré entre-temps garde ses notifications.
  async removePushToken(userId: string, { pushToken }: RemovePushTokenInput) {
    await usersRepo.clearPushToken(userId, pushToken);
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
      throw ApiError.badRequest(
        `L'e-mail doit appartenir au domaine @${company.domain}`,
        'INVALID_EMAIL_DOMAIN',
      );
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

    return usersRepo.findDetailed(user.id);
  },

  async update(actor: AuthUser, userId: string, input: UpdateUserInput) {
    const target = await usersRepo.findInCompany(userId, actor.companyId);
    if (!target) throw ApiError.notFound('Utilisateur introuvable');
    if (target.id === actor.id && input.role && input.role !== actor.role) {
      throw ApiError.badRequest(
        'Vous ne pouvez pas modifier votre propre rôle',
        'SELF_ROLE_CHANGE',
      );
    }
    await usersRepo.update(userId, input);
    return usersRepo.findDetailed(userId);
  },

  async remove(actor: AuthUser, userId: string) {
    if (userId === actor.id)
      throw ApiError.badRequest('Vous ne pouvez pas supprimer votre propre compte', 'SELF_DELETE');
    const target = await usersRepo.findInCompany(userId, actor.companyId);
    if (!target) throw ApiError.notFound('Utilisateur introuvable');
    await usersRepo.delete(userId);
  },
};
