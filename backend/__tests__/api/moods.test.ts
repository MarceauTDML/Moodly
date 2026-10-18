import { Prisma } from '@prisma/client';
import request from 'supertest';
import { prismaMock } from '../__mocks__/prisma.mock';

jest.mock('../../src/config/prisma.config', () => ({ prisma: require('../__mocks__/prisma.mock').prismaMock }));

import { createApp } from '../../src/app';
import { signAccessToken } from '../../src/services/token.service';

const app = createApp();

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'lea.dupont@entreprise.fr',
  role: 'COLLABORATEUR' as const,
  companyId: '22222222-2222-4222-8222-222222222222',
};
const team = { id: '33333333-3333-4333-8333-333333333333', name: 'Équipe Produit' };
const auth = { Authorization: `Bearer ${signAccessToken(user)}` };

const tx = { userDailyCheckin: { create: jest.fn() }, moodEntry: { create: jest.fn() } };

beforeEach(() => {
  prismaMock.user.findUnique.mockResolvedValue(user);
  prismaMock.teamMember.findMany.mockResolvedValue([{ team }]);
  prismaMock.tag.findMany.mockResolvedValue([{ id: 'tag-1', code: 'CHARGE_DE_TRAVAIL', label: '#ChargeDeTravail' }]);
  prismaMock.$transaction.mockImplementation((cb: (t: typeof tx) => unknown) => cb(tx));
  tx.userDailyCheckin.create.mockResolvedValue({});
  tx.moodEntry.create.mockResolvedValue({ id: 'entry-1' });
});

describe('POST /api/v1/moods', () => {
  it('enregistre un mood anonyme', async () => {
    const res = await request(app)
      .post('/api/v1/moods')
      .set(auth)
      .send({ mood: 'BIEN', tags: ['CHARGE_DE_TRAVAIL', 'CHARGE_DE_TRAVAIL'], comment: '  Bonne journée  ' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Ton mood a bien été envoyé !');

    const entry = tx.moodEntry.create.mock.calls[0][0].data;
    expect(entry).not.toHaveProperty('userId');
    expect(entry).toMatchObject({ teamId: team.id, mood: 'BIEN', comment: 'Bonne journée' });
    expect(entry.tags.create).toEqual([{ tagId: 'tag-1' }]);

    const submittedAt: Date = entry.submittedAt;
    expect(submittedAt.getUTCHours() + submittedAt.getUTCMinutes() + submittedAt.getUTCSeconds()).toBe(0);
    expect(tx.userDailyCheckin.create.mock.calls[0][0].data).toMatchObject({ userId: user.id, date: submittedAt });
  });

  it('refuse un second vote le même jour', async () => {
    tx.userDailyCheckin.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint', { code: 'P2002', clientVersion: 'test' }),
    );
    const res = await request(app).post('/api/v1/moods').set(auth).send({ mood: 'MOYEN' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('ALREADY_SUBMITTED');
  });

  it('refuse une humeur inconnue', async () => {
    const res = await request(app).post('/api/v1/moods').set(auth).send({ mood: 'GENIAL' });
    expect(res.status).toBe(400);
  });

  it('exige le teamId si le collaborateur est dans plusieurs équipes', async () => {
    prismaMock.teamMember.findMany.mockResolvedValue([{ team }, { team: { id: '44444444-4444-4444-8444-444444444444', name: 'B' } }]);
    const res = await request(app).post('/api/v1/moods').set(auth).send({ mood: 'BIEN' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('TEAM_REQUIRED');
  });

  it('refuse un utilisateur sans équipe', async () => {
    prismaMock.teamMember.findMany.mockResolvedValue([]);
    const res = await request(app).post('/api/v1/moods').set(auth).send({ mood: 'BIEN' });
    expect(res.status).toBe(403);
  });
});

describe('GET /api/v1/moods/today', () => {
  it('indique si le collaborateur a déjà voté sans révéler son vote', async () => {
    prismaMock.userDailyCheckin.count.mockResolvedValue(1);
    const res = await request(app).get('/api/v1/moods/today').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ hasSubmittedToday: true, canSubmit: false, teams: [team] });
    expect(res.body.data).not.toHaveProperty('mood');
  });
});
