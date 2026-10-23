import { z } from 'zod';

// Code à 6 chiffres, ou code de secours « abcd-efgh » à la connexion.
const code = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^(\d{6}|[a-z2-7]{4}-[a-z2-7]{4})$/, 'Code invalide');

export const setupSchema = z.object({ method: z.enum(['TOTP', 'EMAIL']) });
export const confirmSchema = z.object({ code });
export const disableSchema = z.object({ password: z.string().min(1).max(128) });
export const challengeSchema = z.object({ challengeToken: z.string().min(1).max(2048) });
export const verifySchema = challengeSchema.extend({ code });

export type SetupInput = z.infer<typeof setupSchema>;
export type ConfirmInput = z.infer<typeof confirmSchema>;
export type DisableInput = z.infer<typeof disableSchema>;
export type ChallengeInput = z.infer<typeof challengeSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
