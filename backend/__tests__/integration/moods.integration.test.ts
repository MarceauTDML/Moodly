import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/prisma.config';
import { today } from '../../src/utils/date.util';
import { createCompany, createTeam, createUser, login, resetDatabase } from './helpers/factories';

const app = createApp();

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe('Saisie du mood sur une vraie base', () => {
  it('n’accepte qu’un seul vote quand deux envois arrivent en même temps', async () => {
    const company = await createCompany();
    const team = await createTeam(company.id);
    const user = await createUser(company.id, { teamId: team.id });
    const { token } = await login(app, user.email);

    const send = () =>
      request(app).post('/api/v1/moods').set('Authorization', `Bearer ${token}`).send({ mood: 'BIEN', tags: [] });
    const statuses = (await Promise.all([send(), send()])).map((r) => r.status).sort();

    expect(statuses).toEqual([201, 409]);
    expect(await prisma.moodEntry.count()).toBe(1);
    expect(await prisma.userDailyCheckin.count({ where: { userId: user.id } })).toBe(1);
  });

  it('enregistre la réponse sans aucun lien avec son auteur', async () => {
    const company = await createCompany();
    const team = await createTeam(company.id);
    const user = await createUser(company.id, { teamId: team.id });
    const { token } = await login(app, user.email);

    await request(app)
      .post('/api/v1/moods')
      .set('Authorization', `Bearer ${token}`)
      .send({ mood: 'STRESSE', tags: ['CHARGE_DE_TRAVAIL'], comment: 'Semaine chargée' })
      .expect(201);

    const columns = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'mood_entries'`;
    expect(columns.map((c) => c.column_name).sort()).toEqual(['comment', 'id', 'mood', 'submittedAt', 'teamId']);
    // Seule la journée est conservée : l'heure du vote ne permet pas de recouper les connexions.
    const entry = await prisma.moodEntry.findFirstOrThrow();
    expect(entry.submittedAt).toEqual(today());
  });
});
