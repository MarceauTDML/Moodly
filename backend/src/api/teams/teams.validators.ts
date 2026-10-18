import { z } from 'zod';

export const teamIdParamsSchema = z.object({
  teamId: z.uuid({ error: 'Identifiant d’équipe invalide' }),
});

export const memberParamsSchema = teamIdParamsSchema.extend({
  userId: z.uuid({ error: 'Identifiant utilisateur invalide' }),
});

export const createTeamSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export const updateTeamSchema = createTeamSchema;

export const addMemberSchema = z.object({
  userId: z.uuid(),
  isLead: z.boolean().default(false),
});

export const updateMemberSchema = z.object({
  isLead: z.boolean(),
});

export type TeamIdParams = z.infer<typeof teamIdParamsSchema>;
export type MemberParams = z.infer<typeof memberParamsSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
