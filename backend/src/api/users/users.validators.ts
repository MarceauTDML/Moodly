import { z } from 'zod';

const name = z.string().trim().min(1).max(80);

export const emailSchema = z
  .string({ error: "L'e-mail est requis" })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'E-mail invalide' }));

export const passwordSchema = z
  .string({ error: 'Le mot de passe est requis' })
  .min(12, { error: 'Le mot de passe doit faire au moins 12 caractères' })
  .max(128, { error: 'Le mot de passe ne doit pas dépasser 128 caractères' })
  .regex(/[A-Z]/, { error: 'Il faut au moins une lettre majuscule' })
  .regex(/[a-z]/, { error: 'Il faut au moins une lettre minuscule' })
  .regex(/[0-9]/, { error: 'Il faut au moins un chiffre' })
  .regex(/[^a-zA-Z0-9]/, { error: 'Il faut au moins un symbole (!, @, #, etc.)' });

export const updateMeSchema = z
  .object({ firstName: name.optional(), lastName: name.optional() })
  .refine((v) => Object.keys(v).length > 0, { error: 'Aucune donnée à mettre à jour' });

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1).max(128), newPassword: passwordSchema })
  .refine((v) => v.currentPassword !== v.newPassword, {
    error: "Le nouveau mot de passe doit être différent de l'actuel",
    path: ['newPassword'],
  });

export const notificationSettingsSchema = z
  .object({
    dailyReminderEnabled: z.boolean().optional(),
    emailNotificationsEnabled: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { error: 'Aucune donnée à mettre à jour' });

export const pushTokenSchema = z.object({
  pushToken: z
    .string()
    .regex(/^Expo(nent)?PushToken\[[^\]]+\]$/, { error: 'Jeton Expo invalide' })
    .nullable(),
});

export type UpdateMeInput = z.infer<typeof updateMeSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
export type PushTokenInput = z.infer<typeof pushTokenSchema>;
