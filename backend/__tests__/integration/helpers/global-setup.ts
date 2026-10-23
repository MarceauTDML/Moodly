import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { testDatabaseUrl } from './test-database';

// Crée la base de test si besoin puis applique les migrations, comme en production.
// Les tests vident les tables eux-mêmes (resetDatabase) : rien n'est supprimé ici.
export default async function globalSetup() {
  const url = new URL(testDatabaseUrl());
  const name = url.pathname.slice(1);
  const server = new URL(url);
  server.pathname = '/postgres';
  const admin = new PrismaClient({ datasourceUrl: server.toString() });
  try {
    const existing = await admin.$queryRaw<unknown[]>`SELECT 1 FROM pg_database WHERE datname = ${name}`;
    if (existing.length === 0) await admin.$executeRawUnsafe(`CREATE DATABASE "${name}"`);
  } finally {
    await admin.$disconnect();
  }
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: url.toString() },
    stdio: 'pipe',
  });
}
