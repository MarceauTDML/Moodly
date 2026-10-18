import { z } from 'zod';

export const optionalTeamParamsSchema = z.object({
  teamId: z.uuid({ error: 'Identifiant d’équipe invalide' }).optional(),
});

export const historyQuerySchema = z.object({
  days: z.coerce.number().int().min(7).max(90).default(30),
  teamId: z.uuid().optional(),
});

export type HistoryQuery = z.infer<typeof historyQuerySchema>;
