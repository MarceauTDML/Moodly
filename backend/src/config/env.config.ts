import 'dotenv/config';
import { z } from 'zod';

const bool = (fallback: 'true' | 'false') =>
  z
    .enum(['true', 'false'])
    .default(fallback)
    .transform((v) => v === 'true');

// Contacts d'aide propres à l'entreprise (psychologue, ligne d'écoute…), affichés aux
// collaborateurs à côté des ressources nationales. Facultatif.
const supportResourceSchema = z.object({
  label: z.string().min(1).max(80),
  description: z.string().max(200).optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9 ]{2,20}$/)
    .optional(),
  url: z.url({ protocol: /^https$/ }).optional(),
});

const supportResources = z
  .string()
  .optional()
  .transform((raw, ctx) => {
    if (!raw?.trim()) return [];
    try {
      return z.array(supportResourceSchema).max(5).parse(JSON.parse(raw));
    } catch {
      ctx.addIssue({
        code: 'custom',
        message: 'JSON invalide : [{"label":"…","phone":"…","url":"https://…","description":"…"}]',
      });
      return z.NEVER;
    }
  });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z.string().default('*'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  TIMEZONE: z.string().default('Europe/Paris'),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  RESET_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  APP_URL: z.string().default('moodmap://'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_SECURE: bool('false'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('Mood Map <no-reply@moodmap.app>'),

  MOOD_MIN_RESPONSES: z.coerce.number().int().min(1).default(3),
  SUPPORT_RESOURCES: supportResources,

  ENABLE_JOBS: bool('true'),
  CRON_SNAPSHOTS: z.string().default('*/15 * * * *'),
  CRON_DAILY_REMINDER: z.string().default('0 17 * * 1-5'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  process.stderr.write(`Configuration invalide :\n${issues}\n`);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
