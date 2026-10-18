import { z } from 'zod';
import { emailSchema, passwordSchema } from '../users/users.validators';

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(128),
  password: passwordSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
