import { z } from 'zod';
import { emailSchema, passwordSchema, createUserSchema } from '../users/users.validators';
export const registerSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/, 'Lien d’invitation invalide'),
  password: passwordSchema,
});
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  portal: z.enum(['employee', 'manager']).optional(),
});
export const inviteCollaboratorSchema = createUserSchema;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type InviteCollaboratorInput = z.infer<typeof inviteCollaboratorSchema>;
