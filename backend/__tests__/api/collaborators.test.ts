import request from 'supertest';
import { prismaMock } from '../__mocks__/prisma.mock';
jest.mock('../../src/config/prisma.config', () => ({
  prisma: require('../__mocks__/prisma.mock').prismaMock,
}));
jest.mock('../../src/services/email.service', () => ({
  appLink: (_route: string, params: { token: string }) =>
    `http://localhost:8081/activate-account?token=${params.token}`,
  emailService: { sendInvitation: jest.fn().mockResolvedValue(undefined) },
}));
import { createApp } from '../../src/app';
import { signAccessToken } from '../../src/services/token.service';
const app = createApp();
const actor = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'manager@entreprise.fr',
  role: 'MANAGER' as const,
  companyId: '22222222-2222-4222-8222-222222222222',
};
const id = '33333333-3333-4333-8333-333333333333';
const teamId = '44444444-4444-4444-8444-444444444444';
const input = {
  firstName: 'Camille',
  lastName: 'Bernard',
  email: 'camille@entreprise.fr',
  teamId,
};
const user = {
  id,
  ...input,
  role: 'COLLABORATEUR',
  companyId: actor.companyId,
  createdAt: new Date(),
  invitationSentAt: null,
  passwordHash: 'EN_ATTENTE_ACTIVATION',
  memberships: [{ isLead: false, team: { id: teamId, name: 'Communication' } }],
};
const auth = () => `Bearer ${signAccessToken(actor)}`;
beforeEach(() => {
  prismaMock.user.findUnique.mockResolvedValue(actor);
});

describe('Gestion des collaborateurs', () => {
  it('refuse les collaborateurs et les accès sans session', async () => {
    expect((await request(app).get('/api/v1/users/collaborators')).status).toBe(401);
    prismaMock.user.findUnique.mockResolvedValue({
      ...actor,
      role: 'COLLABORATEUR',
    });
    expect(
      (await request(app).get('/api/v1/users/collaborators').set('Authorization', auth())).status,
    ).toBe(403);
  });
  it('limite la liste aux équipes gérées et ne renvoie aucun hash', async () => {
    prismaMock.user.findMany.mockResolvedValue([user]);
    const res = await request(app).get('/api/v1/users/collaborators').set('Authorization', auth());
    expect(res.status).toBe(200);
    expect(res.body.data[0].status).toBe('PENDING');
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    expect(JSON.stringify(res.body)).not.toContain('invitationToken');
    expect(prismaMock.user.findMany.mock.calls[0][0].where).toMatchObject({
      companyId: actor.companyId,
      role: 'COLLABORATEUR',
      memberships: {
        some: {
          team: { members: { some: { userId: actor.id, isLead: true } } },
        },
      },
    });
  });
  it('crée un compte en attente, avec une appartenance à une équipe', async () => {
    prismaMock.company.findUnique.mockResolvedValue({
      domain: 'entreprise.fr',
    });
    prismaMock.team.findFirst.mockResolvedValue({ id: teamId });
    prismaMock.user.create.mockResolvedValue(user);
    prismaMock.user.findFirst.mockResolvedValue(user);
    const res = await request(app)
      .post('/api/v1/users/collaborators')
      .set('Authorization', auth())
      .send(input);
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('PENDING');
    expect(prismaMock.user.create.mock.calls[0][0].data).toMatchObject({
      companyId: actor.companyId,
      role: 'COLLABORATEUR',
      passwordHash: 'EN_ATTENTE_ACTIVATION',
      memberships: { create: { teamId, isLead: false } },
    });
  });
  it('refuse un domaine extérieur', async () => {
    prismaMock.company.findUnique.mockResolvedValue({
      domain: 'entreprise.fr',
    });
    expect(
      (
        await request(app)
          .post('/api/v1/users/collaborators')
          .set('Authorization', auth())
          .send({ ...input, email: 'x@externe.fr' })
      ).status,
    ).toBe(400);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });
  it('refuse une équipe non gérée, même avec son identifiant', async () => {
    prismaMock.company.findUnique.mockResolvedValue({
      domain: 'entreprise.fr',
    });
    prismaMock.team.findFirst.mockResolvedValue(null);
    expect(
      (
        await request(app)
          .post('/api/v1/users/collaborators')
          .set('Authorization', auth())
          .send(input)
      ).status,
    ).toBe(404);
    expect(prismaMock.team.findFirst.mock.calls[0][0].where).toMatchObject({
      companyId: actor.companyId,
      members: { some: { userId: actor.id, isLead: true } },
    });
  });
  it('refuse la création d’un administrateur depuis ce formulaire', async () => {
    expect(
      (
        await request(app)
          .post('/api/v1/users/collaborators')
          .set('Authorization', auth())
          .send({ ...input, role: 'ADMIN' })
      ).status,
    ).toBe(400);
  });
  it('refuse la consultation et l’invitation d’un compte hors périmètre', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    for (const method of ['get', 'post'] as const) {
      const path = `/api/v1/users/collaborators/${id}${method === 'post' ? '/invite' : ''}`;
      expect((await request(app)[method](path).set('Authorization', auth())).status).toBe(404);
    }
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
  it('prépare un lien en local et ne stocke que son empreinte', async () => {
    prismaMock.user.findFirst.mockResolvedValue(user);
    prismaMock.user.update.mockResolvedValue(user);
    const res = await request(app)
      .post(`/api/v1/users/collaborators/${id}/invite`)
      .set('Authorization', auth());
    expect(res.status).toBe(200);
    expect(res.body.data.delivery).toBe('MANUAL');
    const token = new URL(res.body.data.activationUrl).searchParams.get('token');
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(prismaMock.user.update.mock.calls[0][0].data.invitationToken).not.toBe(token);
    expect(prismaMock.user.update.mock.calls[1][0].data.invitationSentAt).toBeNull();
  });
  it('ne réinvite pas un compte déjà actif', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      ...user,
      passwordHash: '$argon2id$active',
    });
    expect(
      (
        await request(app)
          .post(`/api/v1/users/collaborators/${id}/invite`)
          .set('Authorization', auth())
      ).status,
    ).toBe(409);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});
