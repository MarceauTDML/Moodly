import { z } from 'zod';
export const collaboratorSchema = z.object({
  id: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.literal('COLLABORATEUR'),
  companyId: z.string(),
  createdAt: z.string(),
  status: z.enum(['PENDING', 'ACTIVE']),
  invitationSentAt: z.string().nullable(),
  memberships: z.array(
    z.object({ isLead: z.boolean(), team: z.object({ id: z.string(), name: z.string() }) }),
  ),
});
export const invitationSchema = z.object({
  message: z.string(),
  delivery: z.enum(['EMAIL', 'MANUAL']),
  expiresAt: z.string(),
  activationUrl: z.url().optional(),
});
