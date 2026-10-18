import request from 'supertest';
import { prismaMock } from '../__mocks__/prisma.mock';

jest.mock('../../src/config/prisma.config', () => ({ prisma: require('../__mocks__/prisma.mock').prismaMock }));

import { createApp } from '../../src/app';
import { signAccessToken } from '../../src/services/token.service';
import { hashPassword } from '../../src/utils/hash.util';

const app = createApp();

const PASSWORD = 'MotDePasse2026!';

const baseUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'lea.dupont@entreprise.fr',
  firstName: 'Léa',
  lastName: 'Dupont',
  role: 'COLLABORATEUR' as const,
  companyId: '22222222-2222-4222-8222-222222222222',
  createdAt: new Date('2026-01-01'),
};

const manager = { ...baseUser, id: '55555555-5555-4555-8555-555555555555', email: 'manager@entreprise.fr', role: 'MANAGER' as const };

describe('POST /api/v1/auth/login', () => {
  it('connecte un utilisateur avec des identifiants valides', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: await hashPassword(PASSWORD) });

    const res = await request(app).post('/api/v1/auth/login').send({ email: 'Lea.Dupont@Entreprise.fr ', password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: baseUser.id, email: baseUser.email, role: 'COLLABORATEUR' });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'lea.dupont@entreprise.fr' } });
  });

  it('refuse un mauvais mot de passe', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: await hashPassword(PASSWORD) });
    const res = await request(app).post('/api/v1/auth/login').send({ email: baseUser.email, password: 'mauvais' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Identifiants incorrects');
  });

  it('refuse un compte inexistant avec le même message', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'inconnu@entreprise.fr', password: PASSWORD });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Identifiants incorrects');
  });
});

describe('POST /api/v1/auth/register', () => {
  it('active un compte pré-enregistré par un manager', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: 'EN_ATTENTE_ACTIVATION' });
    prismaMock.user.update.mockResolvedValue(baseUser);

    const res = await request(app).post('/api/v1/auth/register').send({ email: baseUser.email, password: PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ email: baseUser.email, role: 'COLLABORATEUR' });
    const { where, data } = prismaMock.user.update.mock.calls[0][0];
    expect(where).toEqual({ email: baseUser.email });
    expect(data.passwordHash).toMatch(/^\$argon2/);
  });

  it('refuse un e-mail qui n’a pas été ajouté par un manager', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await request(app).post('/api/v1/auth/register').send({ email: 'x@entreprise.fr', password: PASSWORD });
    expect(res.status).toBe(400);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it('refuse un compte déjà activé', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: await hashPassword(PASSWORD) });
    const res = await request(app).post('/api/v1/auth/register').send({ email: baseUser.email, password: PASSWORD });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/déjà été activé/);
  });

  it('impose un mot de passe robuste', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: baseUser.email, password: 'Secret123' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/collaborators', () => {
  it('est réservé aux managers', async () => {
    const res = await request(app)
      .post('/api/v1/auth/collaborators')
      .set('Authorization', `Bearer ${signAccessToken(baseUser)}`)
      .send({ email: 'nouveau@entreprise.fr' });
    expect(res.status).toBe(403);
  });

  it('pré-enregistre un collaborateur dans l’entreprise du manager', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(manager);
    prismaMock.user.create.mockResolvedValue({ email: 'nouveau@entreprise.fr' });

    const res = await request(app)
      .post('/api/v1/auth/collaborators')
      .set('Authorization', `Bearer ${signAccessToken(manager)}`)
      .send({ email: 'nouveau@entreprise.fr' });

    expect(res.status).toBe(201);
    expect(prismaMock.user.create.mock.calls[0][0].data).toMatchObject({
      email: 'nouveau@entreprise.fr',
      passwordHash: 'EN_ATTENTE_ACTIVATION',
      companyId: manager.companyId,
      role: 'COLLABORATEUR',
    });
  });
});
