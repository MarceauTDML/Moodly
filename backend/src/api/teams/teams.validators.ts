import { z } from 'zod';

export const teamIdParamsSchema = z.object({
  teamId: z.uuid({ error: 'Identifiant d’équipe invalide' }),
});

export const createTeamSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const updateTeamSchema = createTeamSchema;

export type TeamIdParams = z.infer<typeof teamIdParamsSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
