import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/prisma.config';
import { createCompany, createUser, login, resetDatabase } from './helpers/factories';

const app = createApp();

beforeEach(resetDatabase);
afterAll(() => prisma.$disconnect());

describe('Appareil associé aux notifications push', () => {
  it('ne désinscrit à la déconnexion que le téléphone qui se déconnecte', async () => {
    const company = await createCompany();
    const user = await createUser(company.id);
    const { token } = await login(app, user.email);
    const auth = { Authorization: `Bearer ${token}` };
    const phoneA = 'ExponentPushToken[telephone-a]';
    const phoneB = 'ExponentPushToken[telephone-b]';

    await request(app).put('/api/v1/users/me/push-token').set(auth).send({ pushToken: phoneA }).expect(200);
    // Le téléphone B s'enregistre ensuite : c'est lui qui reçoit désormais les rappels.
    await request(app).put('/api/v1/users/me/push-token').set(auth).send({ pushToken: phoneB }).expect(200);

    await request(app).delete('/api/v1/users/me/push-token').set(auth).send({ pushToken: phoneA }).expect(204);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).pushToken).toBe(phoneB);

    await request(app).delete('/api/v1/users/me/push-token').set(auth).send({ pushToken: phoneB }).expect(204);
    expect((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).pushToken).toBeNull();
  });
});
