import request from 'supertest';
import { createApp } from '../../src/app';
import { PENDING_ACTIVATION_HASH } from '../../src/config/auth.config';
import { prisma } from '../../src/config/prisma.config';
import { sha256 } from '../../src/utils/hash.util';
import { createCompany, createUser, login, PASSWORD, resetDatabase } from './helpers/factories';

const app = createApp();

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe('Authentification sur une vraie base', () => {
  it('active un compte une seule fois quand le lien est utilisé deux fois en même temps', async () => {
    const company = await createCompany();
    const token = 'b'.repeat(64);
    await prisma.user.create({
      data: {
        email: 'invite@entreprise.fr',
        passwordHash: PENDING_ACTIVATION_HASH,
        firstName: 'Léa',
        lastName: 'Invitée',
        companyId: company.id,
        invitationToken: sha256(token),
        invitationTokenExpiry: new Date(Date.now() + 3_600_000),
      },
    });

    const activate = (password: string) => request(app).post('/api/v1/auth/activate').send({ token, password });
    const statuses = (await Promise.all([activate('PremierEssai2026!'), activate('SecondEssai2026!')]))
      .map((r) => r.status)
      .sort();

    expect(statuses).toEqual([201, 400]);
    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'invite@entreprise.fr' } });
    expect(user.invitationToken).toBeNull();
    expect(user.passwordHash).not.toBe(PENDING_ACTIVATION_HASH);
  });

  it('révoque le jeton de renouvellement après un changement de mot de passe', async () => {
    const company = await createCompany();
    const user = await createUser(company.id);
    const { token, refreshToken } = await login(app, user.email);

    await request(app).post('/api/v1/auth/refresh').send({ refreshToken }).expect(200);
    await request(app)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: PASSWORD, newPassword: 'NouveauMotDePasse2026!' })
      .expect(200);

    const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(401);
  });
});
