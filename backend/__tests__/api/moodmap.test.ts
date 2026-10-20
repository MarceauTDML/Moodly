import request from 'supertest';
import { prismaMock } from '../__mocks__/prisma.mock';

jest.mock('../../src/config/prisma.config', () => ({ prisma: require('../__mocks__/prisma.mock').prismaMock }));

import { createApp } from '../../src/app';
import { signAccessToken } from '../../src/services/token.service';
import { today } from '../../src/utils/date.util';

const app = createApp();

const companyId = '22222222-2222-4222-8222-222222222222';
const team = { id: '33333333-3333-4333-8333-333333333333', name: 'Équipe Produit', companyId, createdAt: new Date(), updatedAt: new Date() };
const manager = { id: '55555555-5555-4555-8555-555555555555', email: 'manager@entreprise.fr', role: 'MANAGER' as const, companyId };
const collaborator = { ...manager, id: '66666666-6666-4666-8666-666666666666', role: 'COLLABORATEUR' as const };

const snapshot = (overrides: Record<string, unknown> = {}) => ({
  id: 'snap',
  teamId: team.id,
  date: today(),
  averageScore: 98,
  status: 'PARFAIT',
  totalResponses: 24,
  flourishingCount: 24,
  strugglingCount: 0,
  trendPercentage30d: 12,
  createdAt: new Date('2026-10-15T17:22:00Z'),
  ...overrides,
});

const asManager = () => {
  prismaMock.user.findUnique.mockResolvedValue(manager);
  prismaMock.teamMember.findFirst.mockResolvedValue({ teamId: team.id });
  prismaMock.team.findUnique.mockResolvedValue(team);
  prismaMock.teamMember.findUnique.mockResolvedValue({ isLead: true });
  return { Authorization: `Bearer ${signAccessToken(manager)}` };
};

describe('GET /api/v1/moodmap/summary', () => {
  it('renvoie le score, le statut et les tendances (maquette « Parfait »)', async () => {
    const auth = asManager();
    prismaMock.moodSnapshot.findFirst
      .mockResolvedValueOnce(snapshot())
      .mockResolvedValueOnce(snapshot({ averageScore: 87.5 }));
    prismaMock.teamMember.count.mockResolvedValue(24);

    const res = await request(app).get('/api/v1/moodmap/summary').set(auth);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      hasEnoughData: true,
      score: 98,
      status: 'PARFAIT',
      statusLabel: 'Parfait',
      title: 'La mood map des collaborateurs est parfaite.',
      lastUpdatedTime: '19:22',
      highlight: { type: 'FLOURISHING', count: 24, total: 24 },
      trend: { points: 10.5, percentage: 12, direction: 'UP' },
    });
  });

  it('met en avant les collaborateurs en difficulté si l’humeur est préoccupante', async () => {
    const auth = asManager();
    prismaMock.moodSnapshot.findFirst
      .mockResolvedValueOnce(snapshot({ averageScore: 32, status: 'PREOCCUPANT', strugglingCount: 16 }))
      .mockResolvedValueOnce(snapshot({ averageScore: 62 }));
    prismaMock.teamMember.count.mockResolvedValue(24);

    const res = await request(app).get('/api/v1/moodmap/summary').set(auth);
    expect(res.body.data.highlight).toMatchObject({ type: 'STRUGGLING', label: 'Collaborateurs en difficulté', count: 16, total: 24 });
    expect(res.body.data.trend.points).toBe(-30);
  });

  it('n’expose rien tant que le seuil d’anonymat n’est pas atteint', async () => {
    const auth = asManager();
    prismaMock.moodSnapshot.findFirst.mockResolvedValue(null);
    prismaMock.teamMember.count.mockResolvedValue(24);

    const res = await request(app).get('/api/v1/moodmap/summary').set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ hasEnoughData: false, score: null, highlight: null });
  });

  it('interdit l’accès aux collaborateurs', async () => {
    prismaMock.user.findUnique.mockResolvedValue(collaborator);
    const res = await request(app)
      .get('/api/v1/moodmap/summary')
      .set('Authorization', `Bearer ${signAccessToken(collaborator)}`);
    expect(res.status).toBe(403);
  });

  it('interdit l’accès à l’équipe d’un autre manager', async () => {
    const auth = asManager();
    prismaMock.teamMember.findUnique.mockResolvedValue({ isLead: false });
    const res = await request(app).get(`/api/v1/moodmap/teams/${team.id}/summary`).set(auth);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/v1/moodmap/history', () => {
  it('renvoie 30 points J1…J30 et masque les jours sous le seuil', async () => {
    const auth = asManager();
    const day = today();
    prismaMock.moodSnapshot.findMany.mockResolvedValue([
      snapshot({ date: day, averageScore: 98.04 }),
      snapshot({ date: new Date(day.getTime() - 86400000), totalResponses: 2 }),
    ]);

    const res = await request(app).get('/api/v1/moodmap/history?days=30').set(auth);

    expect(res.status).toBe(200);
    const { points, zones } = res.body.data;
    expect(points).toHaveLength(30);
    expect(points[0].label).toBe('J1');
    expect(points[29]).toMatchObject({ label: 'J30', score: 98, status: 'PARFAIT' });
    expect(points[28]).toMatchObject({ score: null, totalResponses: 2 });
    expect(zones.map((z: { label: string }) => z.label)).toEqual(['Humeur idéale', 'Humeur passable', 'Humeur préoccupante']);
  });

  it('valide le paramètre days', async () => {
    const auth = asManager();
    const res = await request(app).get('/api/v1/moodmap/history?days=500').set(auth);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/moodmap/trends', () => {
  it('agrège tags et humeurs de la période', async () => {
    const auth = asManager();
    const tag = (code: string) => ({ tag: { code, label: `#${code}` } });
    prismaMock.moodEntry.findMany
      .mockResolvedValueOnce([
        { mood: 'STRESSE', comment: 'Trop de rush', tags: [tag('CHARGE_DE_TRAVAIL')] },
        { mood: 'STRESSE', comment: null, tags: [tag('CHARGE_DE_TRAVAIL')] },
        { mood: 'EPANOUI', comment: null, tags: [tag('AMBIANCE_EQUIPE')] },
        { mood: 'BIEN', comment: null, tags: [] },
      ])
      .mockResolvedValueOnce([]);
    prismaMock.tag.findMany.mockResolvedValue([
      { code: 'CHARGE_DE_TRAVAIL', label: '#CHARGE_DE_TRAVAIL' },
      { code: 'AMBIANCE_EQUIPE', label: '#AMBIANCE_EQUIPE' },
    ]);
    prismaMock.teamMember.count.mockResolvedValue(10);

    const res = await request(app).get('/api/v1/moodmap/trends').set(auth);

    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data.hasEnoughData).toBe(true);
    expect(data.averageScore).toBe(56.3);
    expect(data.tags[0]).toMatchObject({ code: 'CHARGE_DE_TRAVAIL', count: 2, percentage: 50, averageScore: null });
    expect(data.moods.find((m: { code: string }) => m.code === 'STRESSE').count).toBe(2);
    expect(data.comments).toEqual(['Trop de rush']);
  });
});
