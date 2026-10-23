import { Role } from '@prisma/client';
import { z } from 'zod';

const name = z.string().trim().min(1).max(80);

export const emailSchema = z
  .string({ error: "L'e-mail est requis" })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'E-mail invalide' }));

// Mêmes règles que le formulaire d’activation du compte.
export const passwordSchema = z
  .string({ error: 'Le mot de passe est requis' })
  .min(12, { error: 'Le mot de passe doit faire au moins 12 caractères' })
  .max(128, { error: 'Le mot de passe ne doit pas dépasser 128 caractères' })
  .regex(/[A-Z]/, { error: 'Il faut au moins une lettre majuscule' })
  .regex(/[a-z]/, { error: 'Il faut au moins une lettre minuscule' })
  .regex(/[0-9]/, { error: 'Il faut au moins un chiffre' })
  .regex(/[^a-zA-Z0-9]/, {
    error: 'Il faut au moins un symbole (!, @, #, etc.)',
  });

export const userIdParamsSchema = z.object({
  userId: z.uuid({ error: 'Identifiant invalide' }),
});

export const updateMeSchema = z
  .object({ firstName: name.optional(), lastName: name.optional() })
  .refine((v) => Object.keys(v).length > 0, {
    error: 'Aucune donnée à mettre à jour',
  });

// Le mot de passe confirme une action irréversible, même avec une session ouverte.
export const deleteMeSchema = z.object({
  password: z.string().min(1).max(128),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: passwordSchema,
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    error: "Le nouveau mot de passe doit être différent de l'actuel",
    path: ['newPassword'],
  });

export const notificationSettingsSchema = z
  .object({
    dailyReminderEnabled: z.boolean().optional(),
    emailNotificationsEnabled: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    error: 'Aucune donnée à mettre à jour',
  });

export const pushTokenSchema = z.object({
  pushToken: z
    .string()
    .regex(/^Expo(nent)?PushToken\[[^\]]+\]$/, { error: 'Jeton Expo invalide' })
    .nullable(),
});

export const listUsersQuerySchema = z.object({
  role: z.enum(Role).optional(),
  search: z.string().trim().max(100).optional(),
});

export const createUserSchema = z.object({
  email: emailSchema,
  firstName: name,
  lastName: name,
  role: z.enum(Role).default(Role.COLLABORATEUR),
  teamId: z.uuid().optional(),
  isLead: z.boolean().default(false),
});

export const updateUserSchema = z
  .object({
    firstName: name.optional(),
    lastName: name.optional(),
    role: z.enum(Role).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    error: 'Aucune donnée à mettre à jour',
  });

export const collaboratorSchema = z.object({
  email: emailSchema,
  firstName: name,
  lastName: name,
  teamId: z.uuid(),
  role: z.literal('COLLABORATEUR').default('COLLABORATEUR'),
});
export const updateCollaboratorSchema = z.object({
  firstName: name,
  lastName: name,
  email: emailSchema,
  teamId: z.uuid(),
});
export type CollaboratorInput = z.infer<typeof collaboratorSchema>;
export type UpdateCollaboratorInput = z.infer<typeof updateCollaboratorSchema>;
export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteMeInput = z.infer<typeof deleteMeSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
export type PushTokenInput = z.infer<typeof pushTokenSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
