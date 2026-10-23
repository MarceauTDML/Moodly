import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/prisma.config';
import { formatDay, today } from '../../src/utils/date.util';
import { createCompany, createTeam, createUser, login, PASSWORD, resetDatabase } from './helpers/factories';

const app = createApp();

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

const voter = async () => {
  const company = await createCompany();
  const team = await createTeam(company.id);
  const user = await createUser(company.id, { teamId: team.id });
  const { token } = await login(app, user.email);
  const auth = { Authorization: `Bearer ${token}` };
  await request(app).post('/api/v1/moods').set(auth).send({ mood: 'BIEN', tags: [] }).expect(201);
  return { company, user, auth };
};

describe('Suppression de son compte', () => {
  it('supprime le compte et sa participation, mais garde la réponse anonyme', async () => {
    const { user, auth } = await voter();

    await request(app).delete('/api/v1/users/me').set(auth).send({ password: PASSWORD }).expect(204);

    expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeNull();
    expect(await prisma.userDailyCheckin.count()).toBe(0);
    expect(await prisma.teamMember.count({ where: { userId: user.id } })).toBe(0);
    expect(await prisma.moodEntry.count()).toBe(1);
    // La session devient inutilisable immédiatement.
    await request(app).get('/api/v1/users/me').set(auth).expect(401);
  });

  it('exige le bon mot de passe', async () => {
    const { user, auth } = await voter();

    const res = await request(app).delete('/api/v1/users/me').set(auth).send({ password: 'mauvais' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PASSWORD');
    expect(await prisma.user.findUnique({ where: { id: user.id } })).not.toBeNull();
  });

  it('refuse la suppression du dernier administrateur de l’entreprise', async () => {
    const company = await createCompany();
    const admin = await createUser(company.id, { role: 'ADMIN' });
    const { token } = await login(app, admin.email);

    const res = await request(app)
      .delete('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: PASSWORD });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('LAST_ADMIN');
  });
});

describe('Export de ses données', () => {
  it('renvoie le compte et les jours de participation, jamais les humeurs ni les secrets', async () => {
    const { user, auth } = await voter();

    const res = await request(app).get('/api/v1/users/me/export').set(auth).expect(200);

    expect(res.body.data).toMatchObject({
      account: { email: user.email, role: 'COLLABORATEUR' },
      teams: [{ name: 'Équipe', isLead: false }],
      participationDays: [formatDay(today())],
      moods: { included: false },
    });
    const raw = JSON.stringify(res.body);
    expect(raw).not.toContain('passwordHash');
    expect(raw).not.toContain('BIEN');
  });
});
