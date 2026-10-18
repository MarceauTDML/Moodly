import request from 'supertest';
import { prismaMock } from '../__mocks__/prisma.mock';

jest.mock('../../src/config/prisma.config', () => ({ prisma: require('../__mocks__/prisma.mock').prismaMock }));
jest.mock('../../src/services/email.service', () => ({
  emailService: { sendResetPassword: jest.fn(), sendWelcome: jest.fn(), sendDailyReminder: jest.fn() },
}));

import { createApp } from '../../src/app';
import { emailService } from '../../src/services/email.service';
import { sha256 } from '../../src/utils/hash.util';

const app = createApp();

const user = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'lea.dupont@entreprise.fr',
  firstName: 'Léa',
  passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$x$y',
};

describe('POST /api/v1/password/forgot', () => {
  it('répond toujours 200 et n’envoie un e-mail que si le compte existe', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    const unknown = await request(app).post('/api/v1/password/forgot').send({ email: 'x@entreprise.fr' });
    expect(unknown.status).toBe(200);
    expect(emailService.sendResetPassword).not.toHaveBeenCalled();

    prismaMock.user.findUnique.mockResolvedValueOnce(user);
    prismaMock.user.update.mockResolvedValue({});
    const known = await request(app).post('/api/v1/password/forgot').send({ email: user.email });
    expect(known.status).toBe(200);
    expect(emailService.sendResetPassword).toHaveBeenCalledWith(user.email, 'Léa', expect.any(String));
    const stored = prismaMock.user.update.mock.calls[0][0].data.resetToken;
    const sent = (emailService.sendResetPassword as jest.Mock).mock.calls[0][2];
    expect(stored).toBe(sha256(sent));
  });

  it('ignore un compte en attente d’activation', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...user, passwordHash: 'EN_ATTENTE_ACTIVATION' });
    const res = await request(app).post('/api/v1/password/forgot').send({ email: user.email });
    expect(res.status).toBe(200);
    expect(emailService.sendResetPassword).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/password/reset', () => {
  it('met à jour le mot de passe avec un lien valide', async () => {
    prismaMock.user.findFirst.mockResolvedValue(user);
    prismaMock.user.update.mockResolvedValue({});
    const token = 'a'.repeat(64);

    const res = await request(app).post('/api/v1/password/reset').send({ token, password: 'NouveauMotDePasse1!' });

    expect(res.status).toBe(200);
    expect(prismaMock.user.findFirst.mock.calls[0][0].where.resetToken).toBe(sha256(token));
    expect(prismaMock.user.update.mock.calls[0][0].data.passwordHash).toMatch(/^\$argon2/);
  });

  it('refuse un lien invalide ou expiré', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    const res = await request(app).post('/api/v1/password/reset').send({ token: 'b'.repeat(64), password: 'NouveauMotDePasse1!' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_RESET_TOKEN');
  });
});
