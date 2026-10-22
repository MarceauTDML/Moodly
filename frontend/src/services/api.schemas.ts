import { z } from 'zod';
const role = z.enum(['MANAGER', 'ADMIN', 'COLLABORATEUR']);
const status = z.enum(['PARFAIT', 'MOYENNE', 'PREOCCUPANT']);
const score = z.number().min(0).max(100).nullable();
const count = z.number().int().nonnegative();
const team = z.object({
  id: z.string().min(1),
  name: z.string(),
  memberCount: count.optional(),
  companyId: z.string().optional(),
});
const sessionUser = z.object({ id: z.string().min(1), email: z.email(), role });
const trend = z.object({
  periodDays: z.number(),
  points: z.number().nullable(),
  percentage: z.number().nullable(),
  direction: z.enum(['UP', 'DOWN', 'STABLE']).nullable(),
});
const period = z.object({ totalResponses: count, averageScore: score, status: status.nullable() });
const zone = z.object({
  key: z.enum(['IDEALE', 'PASSABLE', 'PREOCCUPANTE']),
  label: z.string(),
  min: z.number(),
  max: z.number(),
});
const bucket = period.extend({ label: z.string(), from: z.string(), to: z.string() });
export const tokensSchema = z.object({
  token: z.string().min(1),
  refreshToken: z.string().min(1),
});
export const loginSchema = tokensSchema.extend({
  message: z.string(),
  user: sessionUser,
});
export const profileSchema = sessionUser.extend({
  firstName: z.string(),
  lastName: z.string(),
  companyId: z.string(),
  createdAt: z.string(),
  company: z.object({ id: z.string(), name: z.string() }).nullable(),
  teams: z.array(z.object({ id: z.string(), name: z.string(), isLead: z.boolean() })),
});
export const teamsSchema = z.array(team);
export const notificationsSchema = z.object({
  dailyReminderEnabled: z.boolean(),
  emailNotificationsEnabled: z.boolean(),
  pushEnabled: z.boolean(),
});
export const summarySchema = z.object({
  team,
  hasEnoughData: z.boolean(),
  minResponses: count,
  date: z.string().nullable(),
  score,
  maxScore: z.number(),
  status: status.nullable(),
  statusLabel: z.string().nullable(),
  title: z.string().nullable(),
  advice: z.string().nullable(),
  lastUpdatedAt: z.string().nullable(),
  lastUpdatedTime: z.string().nullable(),
  totalResponses: count,
  teamSize: count,
  participationRate: z.number(),
  highlight: z
    .object({ type: z.enum(['FLOURISHING', 'STRUGGLING']), label: z.string(), count, total: count })
    .nullable(),
  trend: trend.nullable(),
});
export const historySchema = z.object({
  team,
  periodDays: count,
  from: z.string(),
  to: z.string(),
  zones: z.array(zone),
  period,
  points: z.array(
    z.object({
      index: count,
      label: z.string(),
      date: z.string(),
      score,
      status: status.nullable(),
      totalResponses: count.nullable(),
    }),
  ),
});
export const trendsSchema = z.object({
  team,
  periodDays: count,
  from: z.string(),
  to: z.string(),
  minResponses: count,
  totalResponses: count,
  hasEnoughData: z.boolean(),
  averageScore: score,
  status: status.nullable(),
  trend: trend.nullable(),
  flourishing: z.object({ count, percentage: z.number() }).nullable(),
  struggling: z.object({ count, percentage: z.number() }).nullable(),
  participation: z
    .object({ teamSize: count, averageDailyResponses: z.number(), rate: z.number() })
    .nullable(),
  moods: z.array(
    z.object({
      code: z.enum(['EPANOUI', 'BIEN', 'MOYEN', 'STRESSE']),
      label: z.string(),
      count,
      percentage: z.number(),
    }),
  ),
  tags: z.array(
    z.object({
      code: z.string(),
      label: z.string(),
      count,
      percentage: z.number(),
      averageScore: score,
    }),
  ),
  comments: z.array(z.string()),
});
export const evolutionSchema = z.object({
  team,
  granularity: z.enum(['day', 'week', 'month']),
  zones: z.array(zone),
  series: z.array(bucket),
  overall: period,
  comparison: trend.extend({ current: z.number(), previous: z.number() }).nullable(),
  best: bucket.nullable(),
  worst: bucket.nullable(),
});
