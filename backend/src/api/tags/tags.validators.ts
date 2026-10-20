import { TagCategory } from '@prisma/client';
import { z } from 'zod';

export const tagCodeSchema = z.enum(TagCategory, { error: 'Tag inconnu' });

export const tagCodeParamsSchema = z.object({
  code: tagCodeSchema,
});

export type TagCodeParams = z.infer<typeof tagCodeParamsSchema>;
