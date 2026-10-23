import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/prisma.config';
import { upsertSnapshot } from '../../src/services/mood-score.service';
import { addDays, formatDay, today } from '../../src/utils/date.util';
import { createCompany, createEntries, createTeam, createUser, login, resetDatabase } from './helpers/factories';

const app = createApp();

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

const setup = async () => {
  const company = await createCompany();
  const team = await createTeam(company.id, 'Produit');
  const manager = await createUser(company.id, { role: 'MANAGER', teamId: team.id, isLead: true });
  const { token } = await login(app, manager.email);
  return { company, team, auth: { Authorization: `Bearer ${token}` } };
};

describe('Vue manager sur une vraie base', () => {
  it('masque une journée sous le seuil et affiche une journée au-dessus', async () => {
    const { team, auth } = await setup();
    const yesterday = addDays(today(), -1);
    const before = addDays(today(), -2);
    await createEntries(team.id, before, ['STRESSE', 'BIEN']);
    await createEntries(team.id, yesterday, ['EPANOUI', 'BIEN', 'MOYEN']);
    await upsertSnapshot(team.id, before);
    await upsertSnapshot(team.id, yesterday);

    const res = await request(app).get(`/api/v1/moodmap/teams/${team.id}/history?days=30`).set(auth).expect(200);
    const byDate = new Map(res.body.data.points.map((p: { date: string }) => [p.date, p]));

    expect(byDate.get(formatDay(before))).toMatchObject({ score: null, totalResponses: null });
    expect(byDate.get(formatDay(yesterday))).toMatchObject({ totalResponses: 3, score: expect.any(Number) });
    expect(res.body.data.period.totalResponses).toBe(3);
  });

  it('n’expose jamais les votes du jour, même au-dessus du seuil', async () => {
    const { team, auth } = await setup();
    await createEntries(team.id, today(), ['EPANOUI', 'EPANOUI', 'BIEN', 'STRESSE']);
    await upsertSnapshot(team.id, today());

    const summary = await request(app).get(`/api/v1/moodmap/teams/${team.id}/summary`).set(auth).expect(200);
    expect(summary.body.data).toMatchObject({ hasEnoughData: false, score: null });
  });

  it('refuse l’équipe d’un autre manager', async () => {
    const { company, auth } = await setup();
    const otherTeam = await createTeam(company.id, 'Support');
    await createUser(company.id, { role: 'MANAGER', teamId: otherTeam.id, isLead: true });

    await request(app).get(`/api/v1/moodmap/teams/${otherTeam.id}/summary`).set(auth).expect(403);
  });
});
