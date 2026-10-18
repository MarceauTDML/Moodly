import { z } from 'zod';

export const optionalTeamParamsSchema = z.object({
  teamId: z.uuid({ error: 'Identifiant d’équipe invalide' }).optional(),
});

export const historyQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(90).default(30),
  teamId: z.uuid().optional(),
});

export const trendsQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(90).default(30),
  teamId: z.uuid().optional(),
});

export const evolutionQuerySchema = z.object({
  granularity: z.enum(['day', 'week', 'month']).default('week'),
  periods: z.coerce.number().int().min(2).max(90).default(12),
  teamId: z.uuid().optional(),
});

export type HistoryQuery = z.infer<typeof historyQuerySchema>;
export type TrendsQuery = z.infer<typeof trendsQuerySchema>;
export type EvolutionQuery = z.infer<typeof evolutionQuerySchema>;
