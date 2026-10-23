import { type MoodLevel, type Role, TagCategory } from '@prisma/client';
import request from 'supertest';
import type { App } from 'supertest/types';
import { prisma } from '../../../src/config/prisma.config';
import { hashPassword } from '../../../src/utils/hash.util';

export const PASSWORD = 'MotDePasse2026!';

let passwordHash: string | undefined;
let sequence = 0;

export const resetDatabase = async () => {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  const list = tables.map((t) => `"public"."${t.tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} CASCADE`);
  await prisma.tag.createMany({
    data: Object.values(TagCategory).map((code) => ({ code, label: `#${code}` })),
  });
};

export const createCompany = () => {
  sequence += 1;
  return prisma.company.create({ data: { name: `Entreprise ${sequence}`, domain: `entreprise-${sequence}.fr` } });
};

export const createTeam = (companyId: string, name = 'Équipe') =>
  prisma.team.create({ data: { name, companyId } });

export const createUser = async (
  companyId: string,
  { role = 'COLLABORATEUR', teamId, isLead = false }: { role?: Role; teamId?: string; isLead?: boolean } = {},
) => {
  sequence += 1;
  passwordHash ??= await hashPassword(PASSWORD);
  return prisma.user.create({
    data: {
      email: `user${sequence}@entreprise.fr`,
      passwordHash,
      firstName: 'Prénom',
      lastName: `Nom${sequence}`,
      role,
      companyId,
      ...(teamId ? { memberships: { create: { teamId, isLead } } } : {}),
    },
  });
};

// Réponses déjà anonymes, telles que les écrit moodsRepo.createAnonymousEntry.
export const createEntries = (teamId: string, day: Date, moods: MoodLevel[]) =>
  prisma.moodEntry.createMany({ data: moods.map((mood) => ({ teamId, mood, submittedAt: day })) });

export const login = async (app: App, email: string) => {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password: PASSWORD });
  if (res.status !== 200) throw new Error(`Connexion impossible pour ${email} : ${res.status}`);
  return res.body.data as { token: string; refreshToken: string };
};
