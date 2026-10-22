import { z } from 'zod';

export const COMMENT_MAX_LENGTH = 500;
export const checkinMoodSchema = z.enum(['EPANOUI', 'BIEN', 'MOYEN', 'STRESSE']);
export const checkinTagSchema = z.enum([
  'CHARGE_DE_TRAVAIL',
  'CLARTE_DES_MISSIONS',
  'AMBIANCE_EQUIPE',
  'SOUTIEN_MANAGER',
  'OUTILS_MATERIEL',
  'RECONNAISSANCE',
]);
export const moodOptionsSchema = z.object({
  question: z.string().min(1),
  tagsQuestion: z.string().min(1),
  commentPlaceholder: z.string(),
  moods: z
    .array(
      z.object({ code: checkinMoodSchema, label: z.string(), score: z.number().min(0).max(100) }),
    )
    .length(4),
  tags: z.array(z.object({ id: z.string(), code: checkinTagSchema, label: z.string() })).max(6),
});
export const todayCheckinSchema = z.object({
  date: z.iso.date(),
  hasSubmittedToday: z.boolean(),
  canSubmit: z.boolean(),
  requiresTeamChoice: z.boolean(),
  teams: z.array(z.object({ id: z.uuid(), name: z.string() })),
});
export const moodSubmissionSchema = z.object({
  date: z.iso.date(),
  title: z.string(),
  message: z.string(),
});
export const submitMoodInputSchema = z.object({
  mood: checkinMoodSchema,
  tags: z
    .array(checkinTagSchema)
    .max(6)
    .transform((tags) => [...new Set(tags)]),
  comment: z
    .string()
    .trim()
    .max(COMMENT_MAX_LENGTH)
    .optional()
    .transform((value) => value || undefined),
  teamId: z.uuid().optional(),
});
