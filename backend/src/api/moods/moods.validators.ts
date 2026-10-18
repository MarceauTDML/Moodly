import { MoodLevel } from '@prisma/client';
import { z } from 'zod';
import { COMMENT_MAX_LENGTH } from '../../config/mood.config';
import { tagCodeSchema } from '../tags/tags.validators';

export const submitMoodSchema = z.object({
  mood: z.enum(MoodLevel, { error: 'Humeur invalide (EPANOUI, BIEN, MOYEN ou STRESSE)' }),
  tags: z
    .array(tagCodeSchema)
    .max(6)
    .default([])
    .transform((tags) => [...new Set(tags)]),
  comment: z
    .string()
    .trim()
    .max(COMMENT_MAX_LENGTH, { error: `Le commentaire ne peut pas dépasser ${COMMENT_MAX_LENGTH} caractères` })
    .optional()
    .transform((c) => (c ? c : undefined)),
  teamId: z.uuid().optional(),
});

export type SubmitMoodInput = z.infer<typeof submitMoodSchema>;
