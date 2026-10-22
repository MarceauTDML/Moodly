import request from 'supertest';
import { prismaMock } from '../__mocks__/prisma.mock';
jest.mock('../../src/config/prisma.config', () => ({
  prisma: require('../__mocks__/prisma.mock').prismaMock,
}));
import { createApp } from '../../src/app';
import { signAccessToken } from '../../src/services/token.service';
import { hashPassword, sha256 } from '../../src/utils/hash.util';
const app = createApp();
const PASSWORD = 'MotDePasse2026!';
const TOKEN = 'a'.repeat(64);
const baseUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'lea.dupont@entreprise.fr',
  firstName: 'Léa',
  lastName: 'Dupont',
  role: 'COLLABORATEUR' as const,
  companyId: '22222222-2222-4222-8222-222222222222',
  createdAt: new Date('2026-01-01'),
};

describe('Connexion commune aux deux espaces', () => {
  it('renvoie une session lisible par le front et utilisable sur les routes protégées', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...baseUser,
      passwordHash: await hashPassword(PASSWORD),
      memberships: [],
    });
    prismaMock.company.findUnique.mockResolvedValue({
      id: baseUser.companyId,
      name: 'Entreprise',
    });
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'Lea.Dupont@Entreprise.fr ',
      password: PASSWORD,
      portal: 'employee',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toEqual({
      id: baseUser.id,
      email: baseUser.email,
      role: 'COLLABORATEUR',
    });
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    const profile = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${res.body.data.token}`);
    expect(profile.status).toBe(200);
    expect(profile.body.data).toMatchObject({
      email: baseUser.email,
      teams: [],
    });
  });
  it('refuse le mauvais portail sans émettre de jeton', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...baseUser,
      passwordHash: await hashPassword(PASSWORD),
    });
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: baseUser.email, password: PASSWORD, portal: 'manager' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('WRONG_PORTAL');
    expect(res.body.data).toBeUndefined();
  });
  it.each([null, { ...baseUser, passwordHash: 'EN_ATTENTE_ACTIVATION' }])(
    'refuse un compte absent ou en attente sans divulguer son état',
    async (user) => {
      prismaMock.user.findUnique.mockResolvedValue(user);
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: baseUser.email, password: PASSWORD });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    },
  );
  it('refuse un mauvais mot de passe', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      ...baseUser,
      passwordHash: await hashPassword(PASSWORD),
    });
    expect(
      (
        await request(app)
          .post('/api/v1/auth/login')
          .send({ email: baseUser.email, password: 'mauvais' })
      ).status,
    ).toBe(401);
  });
  it('refuse un jeton signé avec une autre clé', async () => {
    expect(
      (await request(app).get('/api/v1/users/me').set('Authorization', 'Bearer abc.def.ghi'))
        .status,
    ).toBe(401);
  });
});

describe('Activation par invitation', () => {
  it('exige un jeton personnel et ne permet plus une activation par e-mail seul', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: baseUser.email, password: PASSWORD });
    expect(res.status).toBe(400);
    expect(prismaMock.user.updateMany).not.toHaveBeenCalled();
  });
  it('active le compte et consomme le jeton de manière atomique', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      ...baseUser,
      passwordHash: 'EN_ATTENTE_ACTIVATION',
    });
    prismaMock.user.updateMany.mockResolvedValue({ count: 1 });
    const res = await request(app)
      .post('/api/v1/auth/activate')
      .send({ token: TOKEN, password: PASSWORD });
    expect(res.status).toBe(201);
    const { where, data } = prismaMock.user.updateMany.mock.calls[0][0];
    expect(where).toMatchObject({
      id: baseUser.id,
      invitationToken: sha256(TOKEN),
      passwordHash: 'EN_ATTENTE_ACTIVATION',
    });
    expect(data).toMatchObject({
      invitationToken: null,
      invitationTokenExpiry: null,
    });
    expect(data.passwordHash).toMatch(/^\$argon2/);
  });
  it('refuse les liens expirés ou déjà utilisés', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/v1/auth/activate')
      .send({ token: TOKEN, password: PASSWORD });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INVITATION');
  });
  it('refuse la seconde activation concurrente', async () => {
    prismaMock.user.findFirst.mockResolvedValue(baseUser);
    prismaMock.user.updateMany.mockResolvedValue({ count: 0 });
    expect(
      (await request(app).post('/api/v1/auth/activate').send({ token: TOKEN, password: PASSWORD }))
        .status,
    ).toBe(400);
  });
  it('impose le mot de passe robuste avant toute écriture', async () => {
    expect(
      (
        await request(app)
          .post('/api/v1/auth/activate')
          .send({ token: TOKEN, password: 'Secret123' })
      ).status,
    ).toBe(400);
    expect(prismaMock.user.updateMany).not.toHaveBeenCalled();
  });
});
